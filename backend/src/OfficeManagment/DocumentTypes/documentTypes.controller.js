const { validationResult } = require("express-validator");
const { successResponse, errorResponse } = require("../utils/response.utils");
const documentTypesService = require("./documentTypes.service");

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, "Validation failed.", 422, errors.array());
    return true;
  }
  return false;
};

const createDocumentType = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const documentType = await documentTypesService.createDocumentType(
      req.user,
      req.body
    );
    return successResponse(
      res,
      { documentType },
      "Document type created successfully.",
      201
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const listDocumentTypes = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const result = await documentTypesService.listDocumentTypes({
      search: req.query.search,
      status: req.query.status,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 50,
    });
    return successResponse(
      res,
      result,
      "Document types fetched successfully."
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const getDocumentTypeById = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const documentType = await documentTypesService.getDocumentTypeById(
      req.params.id
    );
    return successResponse(
      res,
      { documentType },
      "Document type fetched successfully."
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const updateDocumentType = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const documentType = await documentTypesService.updateDocumentType(
      req.user,
      req.params.id,
      req.body
    );
    return successResponse(
      res,
      { documentType },
      "Document type updated successfully."
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const deleteDocumentType = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    await documentTypesService.deleteDocumentType(req.user, req.params.id);
    return successResponse(res, null, "Document type deleted successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

module.exports = {
  createDocumentType,
  listDocumentTypes,
  getDocumentTypeById,
  updateDocumentType,
  deleteDocumentType,
};
