const { validationResult } = require("express-validator");
const {
  sendSuccess,
  sendPaginated,
  sendError,
} = require("../utils/response.utils");

const documentsService = require("./Documents.service");

const listDocuments = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, "Validation error", 422, errors.array());
  }

  try {
    const {
      page = 1,
      limit = 20,
      documentTypeId,
      clientId,
      taskId,
      search,
    } = req.query;

    const { documents, total } = await documentsService.listDocuments({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      documentTypeId,
      clientId,
      taskId,
      search,
    });

    return sendPaginated(
      res,
      documents,
      total,
      page,
      limit,
      "Documents fetched successfully"
    );
  } catch (err) {
    console.error("LIST DOCUMENTS ERROR =>", err);
    return sendError(res, err.message, err.statusCode || 500);
  }
};


const getDocumentById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, "Validation error", 422, errors.array());
  }

  try {
    const doc = await documentsService.getDocumentById(req.params.id);

    if (!doc) {
      return sendError(res, "Document not found", 404);
    }

    return sendSuccess(res, doc, "Document fetched successfully");
  } catch (err) {
    console.error("GET DOCUMENT ERROR =>", err);
    return sendError(res, err.message, err.statusCode || 500);
  }
};


const uploadDocument = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, "Validation error", 422, errors.array());
  }

  try {
    if (!req.file) {
      return sendError(res, "No file uploaded", 400);
    }

    const document = await documentsService.createDocument({
      file: req.file,
      body: req.body,
      uploadedById: req.user.id,
    });

    return sendSuccess(
      res,
      document,
      "Document uploaded successfully",
      201
    );
  } catch (err) {
    console.error("UPLOAD DOCUMENT ERROR =>", err);
    return sendError(res, err.message, err.statusCode || 500);
  }
};


const deleteDocument = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, "Validation error", 422, errors.array());
  }

  try {
    await documentsService.deleteDocument(req.params.id, req.user.id);

    return sendSuccess(res, null, "Document deleted successfully");
  } catch (err) {
    console.error("DELETE DOCUMENT ERROR =>", err);
    return sendError(res, err.message, err.statusCode || 500);
  }
};


const getDocumentStats = async (req, res) => {
  try {
    const stats = await documentsService.getDocumentStats();
    return sendSuccess(res, stats, "Document stats fetched successfully");
  } catch (err) {
    console.error("STATS ERROR =>", err);
    return sendError(res, err.message, err.statusCode || 500);
  }
};

const downloadDocument = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, "Validation error", 422, errors.array());
  }

  try {
    const doc = await documentsService.getDocumentFile(req.params.id);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${doc.originalName}"`
    );
    res.setHeader("Content-Type", doc.mimeType);

    doc.stream.pipe(res);
  } catch (err) {
    console.error("DOWNLOAD ERROR =>", err);
    return sendError(res, err.message, err.statusCode || 500);
  }
};

const viewDocument = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, "Validation error", 422, errors.array());
  }

  try {
    const doc = await documentsService.getDocumentFile(req.params.id);

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${doc.originalName.replace(/"/g, "")}"`
    );
    res.setHeader("Content-Type", doc.mimeType || "application/octet-stream");
    res.setHeader("X-Content-Type-Options", "nosniff");

    doc.stream.pipe(res);
  } catch (err) {
    console.error("VIEW ERROR =>", err);
    return sendError(res, err.message, err.statusCode || 500);
  }
};

module.exports = {
  listDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
  getDocumentStats,
  downloadDocument,
  viewDocument,
};