const prisma = require("../../shared/prisma");
const googleDriveService = require("../GoogleDrive/googleDrive.service");
const { FREQUENCY_TYPE } = require("../utils/enums");

const VALID_FREQUENCY_TYPES = Object.values(FREQUENCY_TYPE);

const documentSelect = {
  id: true,
  name: true,
  originalName: true,
  fileSize: true,
  mimeType: true,
  driveFileId: true,
  driveUrl: true,
  frequencyType: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  documentType: {
    select: { id: true, name: true, frequencyTypes: true },
  },
  client: {
    select: {
      id: true,
      name: true,
      businessName: true,
      firstName: true,
      lastName: true,
    },
  },
  task: {
    select: { id: true, title: true },
  },
  uploadedBy: {
    select: { id: true, name: true, email: true },
  },
};

async function listDocuments({
  page = 1,
  limit = 20,
  documentTypeId,
  clientId,
  taskId,
  search,
}) {
  const where = { isDeleted: false };

  if (documentTypeId) where.documentTypeId = documentTypeId;
  if (clientId) where.clientId = parseInt(clientId, 10);
  if (taskId) where.taskId = taskId;

  if (search) {
    where.OR = [
      { originalName: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      {
        documentType: {
          name: { contains: search, mode: "insensitive" },
        },
      },
      {
        client: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { businessName: { contains: search, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      select: documentSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.document.count({ where }),
  ]);

  return { documents, total };
}

async function getDocumentById(id) {
  return prisma.document.findFirst({
    where: { id, isDeleted: false },
    select: documentSelect,
  });
}

async function assertDocumentType(documentTypeId) {
  const documentType = await prisma.documentType.findFirst({
    where: {
      id: documentTypeId,
      status: "ACTIVE",
    },
  });

  if (!documentType) {
    throw Object.assign(new Error("Active document type not found."), {
      statusCode: 404,
    });
  }
  return documentType;
}

async function createDocument({ file, body, uploadedById }) {
  const {
    documentTypeId,
    description,
    clientId,
    taskId,
    invoiceId,
    frequencyType = [],
  } = body;

  if (!documentTypeId) {
    throw Object.assign(new Error("Document type is required."), {
      statusCode: 400,
    });
  }

  const documentType = await assertDocumentType(documentTypeId);

  const resolvedFrequencyTypes =
    Array.isArray(frequencyType) && frequencyType.length
      ? frequencyType
      : documentType.frequencyTypes || [];

  const invalidFrequency = resolvedFrequencyTypes.find(
    (item) => !VALID_FREQUENCY_TYPES.includes(item)
  );

  if (invalidFrequency) {
    throw Object.assign(
      new Error(`Invalid frequency type: ${invalidFrequency}`),
      { statusCode: 400 }
    );
  }

  let client = null;
  let task = null;

  if (clientId) {
    client = await prisma.client.findUnique({
      where: { id: parseInt(clientId, 10) },
    });
    if (!client) {
      throw Object.assign(new Error("Client not found"), { statusCode: 404 });
    }
  }

  if (taskId) {
    task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw Object.assign(new Error("Task not found"), { statusCode: 404 });
    }
  }

  const folderType = googleDriveService.resolveFolderType({
    taskId,
    invoiceId,
    clientId,
  });

  const subFolderName = task
    ? task.title
    : client
      ? client.businessName || client.name
      : null;

  const driveFile = await googleDriveService.uploadFileToDrive(uploadedById, {
    buffer: file.buffer,
    originalName: file.originalname,
    mimeType: file.mimetype,
    folderType,
    subFolderName,
  });

  const document = await prisma.document.create({
    data: {
      name: file.originalname,
      originalName: file.originalname,
      fileSize: driveFile.fileSize,
      mimeType: file.mimetype,
      driveFileId: driveFile.driveFileId,
      driveUrl: driveFile.driveUrl,
      documentTypeId,
      frequencyType: resolvedFrequencyTypes,
      description: description || null,
      clientId: clientId ? parseInt(clientId, 10) : null,
      taskId: taskId || null,
      uploadedById,
    },
    select: documentSelect,
  });

  return document;
}

async function deleteDocument(id, deletedById) {
  const doc = await prisma.document.findFirst({
    where: { id, isDeleted: false },
  });
  if (!doc) {
    throw Object.assign(new Error("Document not found"), { statusCode: 404 });
  }

  await googleDriveService.deleteFileFromDrive(
    doc.uploadedById,
    doc.driveFileId
  );

  return prisma.document.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedById,
    },
  });
}

async function getDocumentStats() {
  const stats = await prisma.document.groupBy({
    by: ["documentTypeId"],
    where: { isDeleted: false },
    _count: { id: true },
  });

  const typeIds = stats
    .map((s) => s.documentTypeId)
    .filter(Boolean);

  const types =
    typeIds.length > 0
      ? await prisma.documentType.findMany({
        where: { id: { in: typeIds } },
        select: { id: true, name: true },
      })
      : [];

  const typeMap = new Map(types.map((t) => [t.id, t.name]));
  const totalCount = await prisma.document.count({
    where: { isDeleted: false },
  });

  return {
    total: totalCount,
    byDocumentType: stats.map((s) => ({
      documentTypeId: s.documentTypeId,
      documentTypeName: s.documentTypeId
        ? typeMap.get(s.documentTypeId) || "Unknown"
        : "Uncategorized",
      count: s._count.id,
    })),
  };
}

async function getDocumentFile(id) {
  const doc = await prisma.document.findFirst({
    where: { id, isDeleted: false },
    select: {
      driveFileId: true,
      filePath: true,
      originalName: true,
      mimeType: true,
      uploadedById: true,
    },
  });

  if (!doc) {
    throw Object.assign(new Error("Document not found"), { statusCode: 404 });
  }

  if (!doc.driveFileId) {
    throw Object.assign(
      new Error("This document is not stored in Google Drive."),
      { statusCode: 404 }
    );
  }

  const stream = await googleDriveService.downloadFileFromDrive(
    doc.uploadedById,
    doc.driveFileId
  );

  return { ...doc, stream };
}

module.exports = {
  listDocuments,
  getDocumentById,
  createDocument,
  deleteDocument,
  getDocumentStats,
  getDocumentFile,
};
