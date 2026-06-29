const { query, param, body } = require("express-validator");
const { FREQUENCY_TYPE } = require("../utils/enums");

const VALID_FREQUENCY_TYPES = Object.values(FREQUENCY_TYPE);

const listDocumentsValidator = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("documentTypeId").optional().isUUID(),
  query("clientId").optional().isInt({ min: 1 }).toInt(),
  query("taskId").optional().isString().trim(),
  query("search").optional().isString().trim(),
];

const idParamValidator = [
  param("id").isUUID().withMessage("Invalid document ID"),
];

const uploadDocumentValidator = [
  body("documentTypeId")
    .notEmpty()
    .withMessage("Document type is required.")
    .isUUID()
    .withMessage("Invalid document type ID."),

  body("frequencyType")
    .optional()
    .isArray()
    .withMessage("Frequency type must be an array."),

  body("frequencyType.*")
    .isIn(VALID_FREQUENCY_TYPES)
    .withMessage("Invalid frequency type."),

  body("description")
    .optional()
    .isString()
    .trim(),

  body("clientId")
    .optional()
    .isInt({ min: 1 })
    .toInt(),

  body("taskId")
    .optional()
    .isString()
    .trim(),
];

module.exports = {
  listDocumentsValidator,
  idParamValidator,
  uploadDocumentValidator,
  VALID_FREQUENCY_TYPES,
};
