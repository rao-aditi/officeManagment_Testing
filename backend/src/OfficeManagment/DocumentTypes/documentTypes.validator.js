const { body, param, query } = require("express-validator");
const { FREQUENCY_TYPE } = require("../utils/enums");

const VALID_FREQUENCY_TYPES = Object.values(FREQUENCY_TYPE);

const idParamValidator = [
  param("id")
    .notEmpty()
    .withMessage("Document type id is required.")
    .isUUID()
    .withMessage("Document type id must be a valid UUID."),
];

const listQueryValidator = [
  query("search").optional().isString(),
  query("status").optional().isIn(["ACTIVE", "INACTIVE"]),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

const frequencyTypesRules = (required = true) => {
  const chain = body("frequencyTypes")
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new Error("Frequency types must be an array.");
      }
      if (required && value.length === 0) {
        throw new Error("At least one frequency type is required.");
      }
      const unique = [...new Set(value)];
      const invalid = unique.filter((ft) => !VALID_FREQUENCY_TYPES.includes(ft));
      if (invalid.length > 0) {
        throw new Error(
          `Invalid frequency type(s): ${invalid.join(", ")}.`
        );
      }
      return true;
    });

  return required ? chain : chain.optional();
};

const createDocumentTypeValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Document type name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters."),

  frequencyTypesRules(true),

  body("status")
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Invalid status."),
];

const updateDocumentTypeValidator = [
  ...idParamValidator,

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Document type name cannot be empty.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters."),

  frequencyTypesRules(false),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Invalid status."),

  body().custom((_, { req }) => {
    const fields = ["name", "frequencyTypes", "status"];
    if (!fields.some((field) => req.body[field] !== undefined)) {
      throw new Error("At least one field is required to update.");
    }
    return true;
  }),
];

module.exports = {
  idParamValidator,
  listQueryValidator,
  createDocumentTypeValidator,
  updateDocumentTypeValidator,
};
