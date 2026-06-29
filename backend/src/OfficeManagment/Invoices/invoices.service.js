const prisma = require("../../shared/prisma");
const { audit } = require("../utils/Audit.utils");
const { INVOICE_STATUS, QUOTATION_STATUS, TASK_STATUS, ROLES } = require("../utils/enums");

const invoiceInclude = {
  client: true,

  task: {
    select: {
      id: true,
      title: true,
      status: true,
    },
  },

  serviceType: {
    select: {
      id: true,
      name: true,
    },
  },

  payments: true,

  quotation: {
    select: {
      id: true,
      quotationNo: true,
      finalAmount: true,
      status: true,
    },
  },
};

const shapeInvoice = (row) => {
  if (!row) return row;

  const payments = (row.payments || []).map((p) => ({
    id: p.id,
    amountPaid: Number(p.amountPaid),
    paymentDate: p.paymentDate,
    mode: p.mode,
    referenceNo: p.referenceNo,
    status: p.status,
  }));

  const totalPaid = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + p.amountPaid, 0);

  return {
    id: row.id,
    invoiceNo: row.invoiceNo,
    clientId: row.clientId,
    client: row.client
      ? {
        ...row.client,
        displayName:
          row.client.businessName || row.client.name,
      }
      : null,
    taskId: row.taskId,
    task: row.task
      ? {
        id: row.task.id,
        title: row.task.title,
        status: row.task.status,
      }
      : null,
    quotationId: row.quotationId,
    quotationNo: row.quotation?.quotationNo || null,
    quotationStatus: row.quotation?.status || null,
    serviceTypeId: row.serviceTypeId,
    serviceName: row.serviceType?.name || null,
    serviceCharges: Number(row.serviceCharges),
    taxRate: Number(row.taxRate),
    discountAmount: Number(row.discountAmount),
    total: Number(row.total),
    totalPaid,
    balance: Math.max(0, Number(row.total) - totalPaid),
    status: row.status,
    pdfUrl: row.pdfUrl,
    createdBy: row.createdBy,
    issuedAt: row.issuedAt,
    payments,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

/* Invoice number generator */

const generateInvoiceNo = async () => {
  const last = await prisma.invoice.findFirst({
    orderBy: { invoiceNo: "desc" },
    select: { invoiceNo: true },
  });

  let nextNum = 1;
  if (last?.invoiceNo) {
    const match = last.invoiceNo.match(/INV-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }

  return `INV-${String(nextNum).padStart(5, "0")}`;
};

/* check if user is Admin */
const isAdmin = (actor) => actor?.role === ROLES.ADMIN;

const fail = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
};

/* CREATE INVOICE */
const createInvoice = async (actor, data) => {
  const { quotationId, adminOverride } = data;

  if (!quotationId) fail("Quotation ID is required.");

  /* 1 — Fetch quotation with full relations */
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: {
      clients: {
        include: {
          client: { select: { id: true, name: true, businessName: true } },
        },
      },
      task: { select: { id: true, title: true, status: true } },
      invoices: { select: { id: true } },
    },
  });

  if (!quotation) fail("Quotation not found.", 404);

  /* 2 — Quotation must be APPROVED */
  if (quotation.status !== QUOTATION_STATUS.APPROVED) {
    fail("Invoice can only be created for APPROVED quotations.");
  }

  /* 3 — No duplicate invoices for the same quotation */
  if (quotation.invoices && quotation.invoices.length > 0) {
    fail("An invoice already exists for this quotation.");
  }

  /* 4 — Task must be COMPLETED or APPROVED (unless admin override) */
  if (quotation.task) {
    const taskDone = [TASK_STATUS.COMPLETED, TASK_STATUS.APPROVED].includes(
      quotation.task.status
    );
    if (!taskDone) {
      if (adminOverride && isAdmin(actor)) {
        // Admin override accepted — log it
        await audit({
          actorId: actor.id,
          action: "INVOICE_ADMIN_OVERRIDE",
          entityType: "Invoice",
          entityId: null,
          newValue: {
            quotationId,
            taskId: quotation.task.id,
            taskStatus: quotation.task.status,
            reason: "Admin overrode task completion check",
          },
        });
      } else {
        fail(
          `Related task is in "${quotation.task.status}" status. Task must be COMPLETED or APPROVED before invoice generation.`
        );
      }
    }
  }

  /* 5 — Determine clientId (first client from quotation) */
  const firstClient = quotation.clients?.[0]?.client;
  if (!firstClient) fail("Quotation has no associated client.");
  const clientId = firstClient.id;

  /* 6 — Auto-populate from quotation */
  const invoiceNo = await generateInvoiceNo();

  const created = await prisma.invoice.create({
    data: {
      invoiceNo,
      clientId,
      taskId: quotation.taskId || null,
      quotationId,
      serviceTypeId: quotation.serviceTypeId,
      serviceCharges: quotation.serviceCharges,
      taxRate: quotation.taxRate,
      discountAmount: quotation.discountAmount,
      total: quotation.finalAmount,
      createdBy: actor.id,
      status: INVOICE_STATUS.DRAFT,
      issuedAt: new Date(),
    },
    include: invoiceInclude,
  });

  const shaped = shapeInvoice(created);

  /* 7 — Audit */
  await audit({
    actorId: actor.id,
    action: "INVOICE_CREATED",
    entityType: "Invoice",
    entityId: created.id,
    newValue: shaped,
  });

  return shaped;
};

/* LIST INVOICES */
const listInvoices = async ({ search, status, page = 1, limit = 50 } = {}) => {
  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
        OR: [
          { invoiceNo: { contains: search, mode: "insensitive" } },
          {
            client: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { businessName: { contains: search, mode: "insensitive" } },
              ],
            },
          },
          {
            quotation: {
              quotationNo: { contains: search, mode: "insensitive" },
            },
          },
        ],
      }
      : {}),
  };

  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: invoiceInclude,
      orderBy: { issuedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ]);

  const quotations = await prisma.quotation.findMany({
    where: {
      status: QUOTATION_STATUS.APPROVED,
      invoices: null,
    },
    include: {
      clients: {
        include: {
          client: true,
        },
      },
      serviceType: true,
      task: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedQuotations = quotations.map((q) => {
    const client = q.clients?.[0]?.client || null;

    return {
      id: q.id,
      quotationNo: q.quotationNo,

      taskId: q.taskId,
      taskTitle: q.task?.title || null,
      taskStatus: q.task?.status || null,

      serviceTypeId: q.serviceTypeId,
      serviceName: q.serviceType?.name || null,

      serviceCharges: Number(q.serviceCharges),
      taxRate: Number(q.taxRate),
      discountAmount: Number(q.discountAmount),
      finalAmount: Number(q.finalAmount),

      client: client
        ? {
          ...client,
          displayName: client.businessName || client.name,
        }
        : null,
    };
  });

  return {
    invoices: rows.map(shapeInvoice),
    quotations: formattedQuotations,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/* GET INVOICE BY ID */
const getInvoiceById = async (id) => {
  const row = await prisma.invoice.findUnique({
    where: { id },
    include: invoiceInclude,
  });

  if (!row) fail("Invoice not found.", 404);

  return shapeInvoice(row);
};

/* UPDATE INVOICE STATUS */
const updateInvoiceStatus = async (actor, id, status) => {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) fail("Invoice not found.", 404);

  /* Only Admin can cancel */
  if (status === INVOICE_STATUS.CANCELLED && !isAdmin(actor)) {
    fail("Only Admin can cancel an invoice.", 403);
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: { status },
    include: invoiceInclude,
  });

  const shaped = shapeInvoice(updated);

  await audit({
    actorId: actor?.id,
    action: "INVOICE_STATUS_UPDATED",
    entityType: "Invoice",
    entityId: id,
    oldValue: { status: existing.status },
    newValue: { status },
  });

  return shaped;
};

/* UPDATE INVOICE (Admin only) */
const updateInvoice = async (actor, id, data) => {
  if (!isAdmin(actor)) {
    fail("Only Admin can modify invoice financial details.", 403);
  }

  const existing = await prisma.invoice.findUnique({
    where: { id },
    include: invoiceInclude,
  });
  if (!existing) fail("Invoice not found.", 404);

  const serviceCharges =
    data.serviceCharges != null
      ? Number(data.serviceCharges)
      : Number(existing.serviceCharges);
  const taxRate =
    data.taxRate != null ? Number(data.taxRate) : Number(existing.taxRate);
  const discountAmount =
    data.discountAmount != null
      ? Number(data.discountAmount)
      : Number(existing.discountAmount);

  /* Recalculate total */
  const taxable = Math.max(0, serviceCharges - discountAmount);
  const tax = (taxable * taxRate) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      serviceCharges,
      taxRate,
      discountAmount,
      total,
    },
    include: invoiceInclude,
  });

  const shaped = shapeInvoice(updated);

  await audit({
    actorId: actor.id,
    action: "INVOICE_UPDATED",
    entityType: "Invoice",
    entityId: id,
    oldValue: shapeInvoice(existing),
    newValue: shaped,
  });

  return shaped;
};

/* CANCEL INVOICE (Admin only) */
const cancelInvoice = async (actor, id) => {
  if (!isAdmin(actor)) {
    fail("Only Admin can cancel an invoice.", 403);
  }

  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) fail("Invoice not found.", 404);

  if (existing.status === INVOICE_STATUS.CANCELLED) {
    fail("Invoice is already cancelled.");
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: { status: INVOICE_STATUS.CANCELLED },
    include: invoiceInclude,
  });

  const shaped = shapeInvoice(updated);

  await audit({
    actorId: actor.id,
    action: "INVOICE_CANCELLED",
    entityType: "Invoice",
    entityId: id,
    oldValue: { status: existing.status },
    newValue: { status: INVOICE_STATUS.CANCELLED },
  });

  return shaped;
};

module.exports = {
  createInvoice,
  listInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  updateInvoice,
  cancelInvoice,
};
