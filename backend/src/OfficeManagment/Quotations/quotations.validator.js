const { body, param, query } = require("express-validator");
const { QUOTATION_STATUS } = require("../utils/enums");

const idParamValidator = [
  param("id")
    .notEmpty()
    .withMessage("Quotation id is required.")
    .isUUID()
    .withMessage("Quotation id must be a valid UUID."),
];

const listQueryValidator = [
  query("search").optional().isString(),
  query("status")
    .optional()
    .isIn(Object.values(QUOTATION_STATUS))
    .withMessage("Invalid quotation status."),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

const createQuotationValidator = [
  body("serviceTypeId")
    .notEmpty()
    .withMessage("Service type is required.")
    .isInt({ min: 1 })
    .withMessage("Service type id must be a positive integer.")
    .toInt(),

  body("clientIds")
    .isArray({ min: 1 })
    .withMessage("At least one client is required."),

  body("clientIds.*")
    .isInt({ min: 1 })
    .withMessage("Each client id must be a positive integer.")
    .toInt(),

  body("serviceCharges")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Service charges must be a non-negative number."),

  body("taxRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tax rate must be a non-negative number."),

  body("discountAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount amount must be a non-negative number."),

  body("status")
    .optional()
    .isIn(Object.values(QUOTATION_STATUS))
    .withMessage("Invalid quotation status."),
];

const updateQuotationValidator = [
  ...idParamValidator,

  body("serviceTypeId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Service type id must be a positive integer.")
    .toInt(),

  body("clientIds")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one client is required."),

  body("clientIds.*")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Each client id must be a positive integer.")
    .toInt(),

  body("serviceCharges")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Service charges must be a non-negative number."),

  body("taxRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tax rate must be a non-negative number."),

  body("discountAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount amount must be a non-negative number."),

  body("status")
    .optional()
    .isIn(Object.values(QUOTATION_STATUS))
    .withMessage("Invalid quotation status."),
];

const updateStatusValidator = [
  ...idParamValidator,
  body("status")
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(Object.values(QUOTATION_STATUS))
    .withMessage("Invalid quotation status."),
];

module.exports = {
  idParamValidator,
  listQueryValidator,
  createQuotationValidator,
  updateQuotationValidator,
  updateStatusValidator,
};
