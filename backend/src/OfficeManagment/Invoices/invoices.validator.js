const { body, param, query } = require("express-validator");
const { INVOICE_STATUS } = require("../utils/enums");

const idParamValidator = [
  param("id")
    .notEmpty()
    .withMessage("Invoice id is required.")
    .isUUID()
    .withMessage("Invoice id must be a valid UUID."),
];

const listQueryValidator = [
  query("search").optional().isString(),
  query("status")
    .optional()
    .isIn(Object.values(INVOICE_STATUS))
    .withMessage("Invalid invoice status."),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

const createInvoiceValidator = [
  body("quotationId")
    .notEmpty()
    .withMessage("Quotation is required.")
    .isUUID()
    .withMessage("Invalid quotation id."),

  body("adminOverride")
    .optional()
    .isBoolean(),
];

const updateStatusValidator = [
  ...idParamValidator,
  body("status")
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(Object.values(INVOICE_STATUS))
    .withMessage("Invalid invoice status."),
];

module.exports = {
  idParamValidator,
  listQueryValidator,
  createInvoiceValidator,
  updateStatusValidator,
};
