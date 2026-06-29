const prisma = require("../../shared/prisma");
const { audit } = require("../utils/Audit.utils");
const { FREQUENCY_TYPE } = require("../utils/enums");

const VALID_FREQUENCY_TYPES = Object.values(FREQUENCY_TYPE);

const shapeDocumentType = (row) => {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    frequencyTypes: row.frequencyTypes || [],
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

const validateFrequencyTypes = (frequencyTypes) => {
  if (!Array.isArray(frequencyTypes) || frequencyTypes.length === 0) {
    const err = new Error("At least one frequency type is required.");
    err.statusCode = 400;
    throw err;
  }

  const unique = [...new Set(frequencyTypes)];
  const invalid = unique.filter((ft) => !VALID_FREQUENCY_TYPES.includes(ft));
  if (invalid.length > 0) {
    const err = new Error(
      `Invalid frequency type(s): ${invalid.join(", ")}. Allowed: ${VALID_FREQUENCY_TYPES.join(", ")}.`
    );
    err.statusCode = 400;
    throw err;
  }

  return unique;
};

const findByName = async (name, excludeId = null) => {
  return prisma.documentType.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
};

const createDocumentType = async (actor, data) => {
  const name = data.name?.trim();
  if (!name) {
    const err = new Error("Document type name is required.");
    err.statusCode = 400;
    throw err;
  }

  if (!data.status) {
    const err = new Error("Status is required.");
    err.statusCode = 400;
    throw err;
  }

  const frequencyTypes = validateFrequencyTypes(data.frequencyTypes);

  const existing = await findByName(name);
  if (existing) {
    const err = new Error("A document type with this name already exists.");
    err.statusCode = 409;
    throw err;
  }

  const created = await prisma.documentType.create({
    data: {
      name,
      frequencyTypes,
      status: data.status,
    },
  });

  await audit({
    actorId: actor?.id,
    action: "DOCUMENT_TYPE_CREATED",
    entityType: "DocumentType",
    entityId: created.id,
    newValue: shapeDocumentType(created),
  });

  return shapeDocumentType(created);
};

const listDocumentTypes = async ({ search, status, page = 1, limit = 50 } = {}) => {
  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? { name: { contains: search, mode: "insensitive" } }
      : {}),
  };

  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.documentType.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.documentType.count({ where }),
  ]);

  return {
    documentTypes: rows.map(shapeDocumentType),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getDocumentTypeById = async (id) => {
  const row = await prisma.documentType.findUnique({ where: { id } });
  if (!row) {
    const err = new Error("Document type not found.");
    err.statusCode = 404;
    throw err;
  }
  return shapeDocumentType(row);
};

const updateDocumentType = async (actor, id, data) => {
  const existing = await prisma.documentType.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error("Document type not found.");
    err.statusCode = 404;
    throw err;
  }

  const name = data.name != null ? data.name.trim() : null;
  if (name) {
    const duplicate = await findByName(name, id);
    if (duplicate) {
      const err = new Error("A document type with this name already exists.");
      err.statusCode = 409;
      throw err;
    }
  }

  const frequencyTypes =
    data.frequencyTypes != null
      ? validateFrequencyTypes(data.frequencyTypes)
      : undefined;

  const updated = await prisma.documentType.update({
    where: { id },
    data: {
      ...(name != null ? { name } : {}),
      ...(frequencyTypes != null ? { frequencyTypes } : {}),
      ...(data.status != null ? { status: data.status } : {}),
    },
  });

  await audit({
    actorId: actor?.id,
    action: "DOCUMENT_TYPE_UPDATED",
    entityType: "DocumentType",
    entityId: id,
    oldValue: shapeDocumentType(existing),
    newValue: shapeDocumentType(updated),
  });

  return shapeDocumentType(updated);
};

const deleteDocumentType = async (actor, id) => {
  const existing = await prisma.documentType.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error("Document type not found.");
    err.statusCode = 404;
    throw err;
  }

  await prisma.documentType.delete({ where: { id } });

  await audit({
    actorId: actor?.id,
    action: "DOCUMENT_TYPE_DELETED",
    entityType: "DocumentType",
    entityId: id,
    oldValue: shapeDocumentType(existing),
  });
};

module.exports = {
  createDocumentType,
  listDocumentTypes,
  getDocumentTypeById,
  updateDocumentType,
  deleteDocumentType,
};
