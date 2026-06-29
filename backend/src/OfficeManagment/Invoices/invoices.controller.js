const { validationResult } = require("express-validator");
const { successResponse, errorResponse } = require("../utils/response.utils");
const invoicesService = require("./invoices.service");

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, "Validation failed.", 422, errors.array());
    return true;
  }
  return false;
};

/* Create Invoice */
const createInvoice = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const invoice = await invoicesService.createInvoice(req.user, req.body);
    return successResponse(
      res,
      { invoice },
      "Invoice created successfully.",
      201
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/* List Invoices */
const listInvoices = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const result = await invoicesService.listInvoices({
      search: req.query.search,
      status: req.query.status,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 50,
    });
    return successResponse(res, result, "Invoices fetched successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/* Get Invoice By ID */
const getInvoiceById = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const invoice = await invoicesService.getInvoiceById(req.params.id);
    return successResponse(res, { invoice }, "Invoice fetched successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/* Update Invoice Status  */
const updateInvoiceStatus = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const invoice = await invoicesService.updateInvoiceStatus(
      req.user,
      req.params.id,
      req.body.status
    );
    return successResponse(
      res,
      { invoice },
      "Invoice status updated successfully."
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/*  Update Invoice (Admin — financial fields) */
const updateInvoice = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const invoice = await invoicesService.updateInvoice(
      req.user,
      req.params.id,
      req.body
    );
    return successResponse(
      res,
      { invoice },
      "Invoice updated successfully."
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/* Cancel Invoice (Admin only)  */
const cancelInvoice = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const invoice = await invoicesService.cancelInvoice(
      req.user,
      req.params.id
    );
    return successResponse(
      res,
      { invoice },
      "Invoice cancelled successfully."
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

module.exports = {
  createInvoice,
  listInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  updateInvoice,
  cancelInvoice,
};
