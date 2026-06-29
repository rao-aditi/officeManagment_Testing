const { validationResult } = require("express-validator");
const { successResponse, errorResponse } = require("../utils/response.utils");
const paymentsService = require("./payments.service");

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, "Validation failed.", 422, errors.array());
    return true;
  }
  return false;
};

const createPayment = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const payment = await paymentsService.createPayment(req.user, req.body);
    return successResponse(
      res,
      { payment },
      "Payment recorded successfully.",
      201
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const listPayments = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const result = await paymentsService.listPayments({
      search: req.query.search,
      status: req.query.status,
      invoiceId: req.query.invoiceId,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 50,
    });
    return successResponse(res, result, "Payments fetched successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const getPaymentById = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const payment = await paymentsService.getPaymentById(req.params.id);
    return successResponse(res, { payment }, "Payment fetched successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const listPaymentsByInvoice = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const payments = await paymentsService.listPaymentsByInvoice(
      req.params.invoiceId
    );
    return successResponse(
      res,
      { payments },
      "Invoice payments fetched successfully."
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

module.exports = {
  createPayment,
  listPayments,
  getPaymentById,
  listPaymentsByInvoice,
};
