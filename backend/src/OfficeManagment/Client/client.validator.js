const { body } = require("express-validator");

const createClientValidator = [
  body("clientCode")
    .optional()
    .trim(),

  body("legalName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage(
      "Legal name must be between 2 and 200 characters."
    ),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage(
      "Name must be between 2 and 200 characters."
    ),

  body("category")
    .optional()
    .trim(),

  body("mobile")
    .optional()
    .trim(),

  body("phone")
    .optional()
    .trim(),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address.")
    .normalizeEmail(),

  body("pan")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage(
      "PAN must be a valid 10-character PAN."
    ),

  body("gstin")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 15, max: 15 })
    .withMessage("GSTIN must be 15 characters."),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Address must not exceed 500 characters."),

  body("serviceType")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Service type cannot be empty."),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE."),
];

const updateClientValidator = [
  body("legalName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage(
      "Legal name must be between 2 and 200 characters."
    ),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address.")
    .normalizeEmail(),

  body("mobile")
    .optional()
    .trim(),

  body("pan")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage(
      "PAN must be a valid 10-character PAN."
    ),

  body("gstin")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 15, max: 15 })
    .withMessage("GSTIN must be 15 characters."),
];

module.exports = {
  createClientValidator,
  updateClientValidator,
};