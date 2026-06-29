const prisma = require("../../shared/prisma");
const { audit } = require("../utils/Audit.utils");
const { QUOTATION_STATUS } = require("../utils/enums");

const quotationInclude = {
  serviceType: {
    select: {
      id: true,
      name: true,
      serviceCharges: true,
      taxRate: true,
      discountAllowed: true,
      couponCode: true,
      status: true,
    },
  },
  creator: {
    select: { id: true, name: true, email: true },
  },
  clients: {
    include: {
      client: {
        select: {
          id: true,
          code: true,
          name: true,
          businessName: true,
          status: true,
        },
      },
    },
  },
};

const shapeQuotation = (row) => {
  if (!row) return row;

  const clients = (row.clients || []).map((qc) => ({
    id: qc.client.id,
    code: qc.client.code,
    name: qc.client.name,
    businessName: qc.client.businessName,
    status: qc.client.status,
  }));

  return {
    id: row.id,
    quotationNo: row.quotationNo,
    quotationDate: row.quotationDate,
    taskId: row.taskId,
    serviceTypeId: row.serviceTypeId,
    serviceName: row.serviceType?.name || null,
    serviceCharges: Number(row.serviceCharges),
    taxRate: Number(row.taxRate),
    discountAmount: Number(row.discountAmount),
    finalAmount: Number(row.finalAmount),
    status: row.status,
    createdBy: row.createdBy,
    creatorName: row.creator?.name || null,
    clients,
    clientNames: clients.map((c) => c.businessName || c.name).join(", "),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

const generateQuotationNo = async () => {
  const count = await prisma.quotation.count();
  return `QTN-${String(count + 1).padStart(5, "0")}`;
};

const computeFinalAmount = (serviceCharges, taxRate, discountAmount = 0) => {
  const taxable = Math.max(0, Number(serviceCharges) - Number(discountAmount));
  const tax = (taxable * Number(taxRate)) / 100;
  return Math.round((taxable + tax) * 100) / 100;
};

const createQuotation = async (actor, data) => {
  const serviceType = await prisma.serviceType.findUnique({
    where: { id: data.serviceTypeId },
  });

  if (data.taskId) {
    const task = await prisma.task.findUnique({
      where: { id: data.taskId },
    });

    if (!task) {
      const err = new Error("Task not found.");
      err.statusCode = 404;
      throw err;
    }
  }

  if (!serviceType) {
    const err = new Error("Service type not found.");
    err.statusCode = 404;
    throw err;
  }

  const clientIds = Array.isArray(data.clientIds)
    ? [...new Set(data.clientIds.map((id) => Number(id)).filter((id) => id > 0))]
    : [];

  if (clientIds.length === 0) {
    const err = new Error("At least one client is required.");
    err.statusCode = 400;
    throw err;
  }

  const existingClients = await prisma.client.findMany({
    where: { id: { in: clientIds } },
    select: { id: true },
  });

  if (existingClients.length !== clientIds.length) {
    const err = new Error("One or more clients were not found.");
    err.statusCode = 404;
    throw err;
  }

  const serviceCharges =
    data.serviceCharges != null
      ? Number(data.serviceCharges)
      : Number(serviceType.serviceCharges);
  const taxRate =
    data.taxRate != null ? Number(data.taxRate) : Number(serviceType.taxRate);
  const discountAmount = Number(data.discountAmount || 0);
  const finalAmount = computeFinalAmount(
    serviceCharges,
    taxRate,
    discountAmount
  );

  const quotationNo = await generateQuotationNo();

  const created = await prisma.quotation.create({
    data: {
      quotationNo,
      taskId: data.taskId || null,
      serviceTypeId: data.serviceTypeId,
      serviceCharges,
      taxRate,
      quotationDate: data.quotationDate ? new Date(data.quotationDate) : undefined,
      discountAmount,
      finalAmount,
      status: data.status || QUOTATION_STATUS.SENT,
      createdBy: actor.id,
      clients: {
        create: clientIds.map((clientId) => ({ clientId })),
      },
    },
    include: quotationInclude,
  });

  const shaped = shapeQuotation(created);

  await audit({
    actorId: actor?.id,
    action: "QUOTATION_CREATED",
    entityType: "Quotation",
    entityId: created.id,
    newValue: shaped,
  });

  return shaped;
};

const listQuotations = async ({
  search,
  status,
  page = 1,
  limit = 50,
} = {}) => {
  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
        OR: [
          { quotationNo: { contains: search, mode: "insensitive" } },
          {
            serviceType: {
              name: { contains: search, mode: "insensitive" },
            },
          },
          {
            clients: {
              some: {
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
          },
        ],
      }
      : {}),
  };

  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.quotation.findMany({
      where,
      include: quotationInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.quotation.count({ where }),
  ]);

  return {
    quotations: rows.map(shapeQuotation),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getQuotationById = async (id) => {
  const row = await prisma.quotation.findUnique({
    where: { id },
    include: quotationInclude,
  });

  if (!row) {
    const err = new Error("Quotation not found.");
    err.statusCode = 404;
    throw err;
  }

  return shapeQuotation(row);
};

const updateQuotationStatus = async (actor, id, status) => {
  const existing = await prisma.quotation.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error("Quotation not found.");
    err.statusCode = 404;
    throw err;
  }

  const updated = await prisma.quotation.update({
    where: { id },
    data: { status },
    include: quotationInclude,
  });

  const shaped = shapeQuotation(updated);

  await audit({
    actorId: actor?.id,
    action: "QUOTATION_STATUS_UPDATED",
    entityType: "Quotation",
    entityId: id,
    oldValue: { status: existing.status },
    newValue: { status },
  });

  return shaped;
};

const updateQuotation = async (actor, id, data) => {
  const existing = await prisma.quotation.findUnique({
    where: { id },
    include: quotationInclude,
  });

  if (!existing) {
    const err = new Error("Quotation not found.");
    err.statusCode = 404;
    throw err;
  }

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
  const finalAmount = computeFinalAmount(
    serviceCharges,
    taxRate,
    discountAmount
  );

  const clientIds = Array.isArray(data.clientIds)
    ? [...new Set(data.clientIds.map((cid) => Number(cid)).filter((cid) => cid > 0))]
    : null;

  if (clientIds && clientIds.length === 0) {
    const err = new Error("At least one client is required.");
    err.statusCode = 400;
    throw err;
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (clientIds) {
      await tx.quotationClient.deleteMany({ where: { quotationId: id } });
      await tx.quotationClient.createMany({
        data: clientIds.map((clientId) => ({ quotationId: id, clientId })),
      });
    }

    return tx.quotation.update({
      where: { id },
      data: {
        ...(data.serviceTypeId != null ? { serviceTypeId: data.serviceTypeId } : {}),
        ...(data.quotationDate ? { quotationDate: new Date(data.quotationDate) } : {}),
        serviceCharges,
        taxRate,
        discountAmount,
        finalAmount,
        ...(data.status != null ? { status: data.status } : {}),
      },
      include: quotationInclude,
    });
  });

  const shaped = shapeQuotation(updated);

  await audit({
    actorId: actor?.id,
    action: "QUOTATION_UPDATED",
    entityType: "Quotation",
    entityId: id,
    oldValue: shapeQuotation(existing),
    newValue: shaped,
  });

  return shaped;
};

module.exports = {
  createQuotation,
  listQuotations,
  getQuotationById,
  updateQuotationStatus,
  updateQuotation,
};
