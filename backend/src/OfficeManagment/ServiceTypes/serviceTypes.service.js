const prisma = require("../../shared/prisma");
const { audit } = require("../utils/Audit.utils");

const shapeServiceType = (row) => {
  if (!row) return row;
  return {
    id: row.id,
    serviceName: row.name,
    baseAmount: Number(row.serviceCharges),
    taxRate: Number(row.taxRate),
    discountAllowed: row.discountAllowed,
    couponCode: row.couponCode || null,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

const resolveServiceName = (data) =>
  data.serviceTypeName ?? data.serviceName ?? null;

const resolveBaseAmount = (data) => {
  if (data.baseAmount != null && data.baseAmount !== "") {
    return Number(data.baseAmount);
  }
  if (data.serviceCharges != null && data.serviceCharges !== "") {
    return Number(data.serviceCharges);
  }
  return null;
};

const findByName = async (name, excludeId = null) => {
  return prisma.serviceType.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId != null ? { id: { not: excludeId } } : {}),
    },
  });
};

const createServiceType = async (actor, data) => {
  const serviceName = resolveServiceName(data);
  if (!serviceName?.trim()) {
    const err = new Error("Service name is required.");
    err.statusCode = 400;
    throw err;
  }

  const baseAmount = resolveBaseAmount(data);
  if (baseAmount == null || Number.isNaN(baseAmount)) {
    const err = new Error("Base amount is required.");
    err.statusCode = 400;
    throw err;
  }

  if (data.taxRate == null || data.taxRate === "") {
    const err = new Error("Tax rate is required.");
    err.statusCode = 400;
    throw err;
  }

  if (!data.status) {
    const err = new Error("Status is required.");
    err.statusCode = 400;
    throw err;
  }

  const discountAllowed = Boolean(data.discountAllowed);
  const couponCode = data.couponCode?.trim() || null;

  if (discountAllowed && !couponCode) {
    const err = new Error("Coupon code is required when discount is allowed.");
    err.statusCode = 400;
    throw err;
  }

  const existing = await findByName(serviceName);
  if (existing) {
    const err = new Error("A service type with this name already exists.");
    err.statusCode = 409;
    throw err;
  }

  const created = await prisma.serviceType.create({
    data: {
      name: serviceName.trim(),
      serviceCharges: baseAmount,
      taxRate: data.taxRate,
      discountAllowed,
      couponCode: discountAllowed ? couponCode : null,
      status: data.status,
    },
  });

  await audit({
    actorId: actor?.id,
    action: "SERVICE_FEE_CREATED",
    entityType: "ServiceType",
    entityId: String(created.id),
    newValue: shapeServiceType(created),
  });

  return shapeServiceType(created);
};

const listServiceTypes = async ({ search, status, page = 1, limit = 50 } = {}) => {
  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? { name: { contains: search, mode: "insensitive" } }
      : {}),
  };

  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.serviceType.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.serviceType.count({ where }),
  ]);

  return {
    serviceTypes: rows.map(shapeServiceType),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getServiceTypeById = async (id) => {
  const row = await prisma.serviceType.findUnique({ where: { id } });
  if (!row) {
    const err = new Error("Service type not found.");
    err.statusCode = 404;
    throw err;
  }
  return shapeServiceType(row);
};

const updateServiceType = async (actor, id, data) => {
  const existing = await prisma.serviceType.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error("Service type not found.");
    err.statusCode = 404;
    throw err;
  }

  const serviceName = resolveServiceName(data);
  if (serviceName) {
    const duplicate = await findByName(serviceName, id);
    if (duplicate) {
      const err = new Error("A service type with this name already exists.");
      err.statusCode = 409;
      throw err;
    }
  }

  const baseAmount = resolveBaseAmount(data);
  const discountAllowed =
    data.discountAllowed != null
      ? Boolean(data.discountAllowed)
      : existing.discountAllowed;

  let couponCode =
    data.couponCode !== undefined
      ? data.couponCode?.trim() || null
      : existing.couponCode;

  if (!discountAllowed) {
    couponCode = null;
  } else if (!couponCode) {
    const err = new Error("Coupon code is required when discount is allowed.");
    err.statusCode = 400;
    throw err;
  }

  const updated = await prisma.serviceType.update({
    where: { id },
    data: {
      ...(serviceName != null ? { name: serviceName.trim() } : {}),
      ...(baseAmount != null ? { serviceCharges: baseAmount } : {}),
      ...(data.taxRate != null ? { taxRate: data.taxRate } : {}),
      ...(data.discountAllowed != null
        ? { discountAllowed }
        : {}),
      couponCode,
      ...(data.status != null ? { status: data.status } : {}),
    },
  });

  await audit({
    actorId: actor?.id,
    action: "SERVICE_FEE_UPDATED",
    entityType: "ServiceType",
    entityId: String(id),
    oldValue: shapeServiceType(existing),
    newValue: shapeServiceType(updated),
  });

  return shapeServiceType(updated);
};

const deleteServiceType = async (actor, id) => {
  const existing = await prisma.serviceType.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error("Service type not found.");
    err.statusCode = 404;
    throw err;
  }

  await prisma.serviceType.delete({ where: { id } });

  await audit({
    actorId: actor?.id,
    action: "SERVICE_FEE_DELETED",
    entityType: "ServiceType",
    entityId: String(id),
    oldValue: shapeServiceType(existing),
  });
};

module.exports = {
  createServiceType,
  listServiceTypes,
  getServiceTypeById,
  updateServiceType,
  deleteServiceType,
};
