const { body, param, query } = require("express-validator");
const { PAYMENT_MODE, PAYMENT_STATUS } = require("../utils/enums");

const idParamValidator = [
  param("id")
    .notEmpty()
    .withMessage("Payment id is required.")
    .isUUID()
    .withMessage("Payment id must be a valid UUID."),
];

const invoiceIdParamValidator = [
  param("invoiceId")
    .notEmpty()
    .withMessage("Invoice id is required.")
    .isUUID()
    .withMessage("Invoice id must be a valid UUID."),
];

const listQueryValidator = [
  query("search").optional().isString(),
  query("status")
    .optional()
    .isIn(Object.values(PAYMENT_STATUS))
    .withMessage("Invalid payment status."),
  query("invoiceId").optional().isUUID(),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

const createPaymentValidator = [
  body("invoiceId")
    .notEmpty()
    .withMessage("Invoice id is required.")
    .isUUID()
    .withMessage("Invoice id must be a valid UUID."),

  body("amountPaid")
    .notEmpty()
    .withMessage("Amount paid is required.")
    .isFloat({ min: 0.01 })
    .withMessage("Amount paid must be greater than zero."),

  body("paymentDate").optional().isISO8601(),

  body("mode")
    .notEmpty()
    .withMessage("Payment mode is required.")
    .isIn(Object.values(PAYMENT_MODE))
    .withMessage("Invalid payment mode."),

  body("referenceNo").optional().trim().isLength({ max: 100 }),

  body("status")
    .optional()
    .isIn(Object.values(PAYMENT_STATUS))
    .withMessage("Invalid payment status."),
];

module.exports = {
  idParamValidator,
  invoiceIdParamValidator,
  listQueryValidator,
  createPaymentValidator,
};
