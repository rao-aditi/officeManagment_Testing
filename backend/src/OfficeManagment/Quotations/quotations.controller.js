const { validationResult } = require("express-validator");
const { successResponse, errorResponse } = require("../utils/response.utils");
const quotationsService = require("./quotations.service");

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, "Validation failed.", 422, errors.array());
    return true;
  }
  return false;
};

const createQuotation = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const quotation = await quotationsService.createQuotation(
      req.user,
      req.body
    );
    return successResponse(
      res,
      { quotation },
      "Quotation created successfully.",
      201
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const listQuotations = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const result = await quotationsService.listQuotations({
      search: req.query.search,
      status: req.query.status,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 50,
    });
    return successResponse(res, result, "Quotations fetched successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const getQuotationById = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const quotation = await quotationsService.getQuotationById(req.params.id);
    return successResponse(
      res,
      { quotation },
      "Quotation fetched successfully."
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const updateQuotationStatus = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const quotation = await quotationsService.updateQuotationStatus(
      req.user,
      req.params.id,
      req.body.status
    );
    return successResponse(
      res,
      { quotation },
      "Quotation status updated successfully."
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const updateQuotation = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const quotation = await quotationsService.updateQuotation(
      req.user,
      req.params.id,
      req.body
    );
    return successResponse(
      res,
      { quotation },
      "Quotation updated successfully."
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

module.exports = {
  createQuotation,
  listQuotations,
  getQuotationById,
  updateQuotationStatus,
  updateQuotation,
};
