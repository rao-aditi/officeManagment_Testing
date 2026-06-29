const prisma = require("../../shared/prisma");
const { audit } = require("../utils/Audit.utils");
const { INVOICE_STATUS, PAYMENT_STATUS } = require("../utils/enums");

const paymentInclude = {
  invoice: {
    select: {
      id: true,
      invoiceNo: true,
      total: true,
      status: true,
      client: {
        select: {
          id: true,
          name: true,
          businessName: true,
        },
      },
    },
  },
};

const shapePayment = (row) => {
  if (!row) return row;

  return {
    id: row.id,
    invoiceId: row.invoiceId,
    invoiceNo: row.invoice?.invoiceNo || null,
    clientName:
      row.invoice?.client?.businessName || row.invoice?.client?.name || null,
    amountPaid: Number(row.amountPaid),
    paymentDate: row.paymentDate,
    mode: row.mode,
    referenceNo: row.referenceNo,
    status: row.status,
    createdAt: row.createdAt,
  };
};

const syncInvoicePaymentStatus = async (invoiceId, tx = prisma) => {
  const invoice = await tx.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });

  if (!invoice) return;

  const totalPaid = invoice.payments
    .filter((p) => p.status === PAYMENT_STATUS.SUCCESS)
    .reduce((sum, p) => sum + Number(p.amountPaid), 0);

  const total = Number(invoice.total);
  let nextStatus = invoice.status;

  if (totalPaid >= total) {
    nextStatus = INVOICE_STATUS.PAID;
  } else if (totalPaid > 0) {
    nextStatus = INVOICE_STATUS.PARTIALLY_PAID;
  }

  if (nextStatus !== invoice.status) {
    await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: nextStatus },
    });
  }
};

const createPayment = async (actor, data) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: data.invoiceId },
  });

  if (!invoice) {
    const err = new Error("Invoice not found.");
    err.statusCode = 404;
    throw err;
  }

  const created = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        invoiceId: data.invoiceId,
        amountPaid: data.amountPaid,
        paymentDate: data.paymentDate
          ? new Date(data.paymentDate)
          : new Date(),
        mode: data.mode,
        referenceNo: data.referenceNo || null,
        status: data.status || PAYMENT_STATUS.SUCCESS,
      },
      include: paymentInclude,
    });

    await syncInvoicePaymentStatus(data.invoiceId, tx);

    return payment;
  });

  const shaped = shapePayment(created);

  await audit({
    actorId: actor?.id,
    action: "PAYMENT_RECORDED",
    entityType: "Payment",
    entityId: created.id,
    newValue: shaped,
  });

  return shaped;
};

const listPayments = async ({
  search,
  status,
  invoiceId,
  page = 1,
  limit = 50,
} = {}) => {
  const where = {
    ...(status ? { status } : {}),
    ...(invoiceId ? { invoiceId } : {}),
    ...(search
      ? {
          OR: [
            { referenceNo: { contains: search, mode: "insensitive" } },
            {
              invoice: {
                invoiceNo: { contains: search, mode: "insensitive" },
              },
            },
            {
              invoice: {
                client: {
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    {
                      businessName: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                  ],
                },
              },
            },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: paymentInclude,
      orderBy: { paymentDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments: rows.map(shapePayment),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getPaymentById = async (id) => {
  const row = await prisma.payment.findUnique({
    where: { id },
    include: paymentInclude,
  });

  if (!row) {
    const err = new Error("Payment not found.");
    err.statusCode = 404;
    throw err;
  }

  return shapePayment(row);
};

const listPaymentsByInvoice = async (invoiceId) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    const err = new Error("Invoice not found.");
    err.statusCode = 404;
    throw err;
  }

  const rows = await prisma.payment.findMany({
    where: { invoiceId },
    include: paymentInclude,
    orderBy: { paymentDate: "desc" },
  });

  return rows.map(shapePayment);
};

module.exports = {
  createPayment,
  listPayments,
  getPaymentById,
  listPaymentsByInvoice,
};
