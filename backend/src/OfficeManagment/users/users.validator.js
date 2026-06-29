const { body, param, query } = require("express-validator");
const { USER_STATUS } = require("../utils/enums");

const createUserValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Enter a valid email address.")
    .normalizeEmail(),

  body("phone")
    .optional()
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Phone must be between 8 and 20 characters."),

  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one digit."),

  body("role")
    .notEmpty()
    .withMessage("Role is required.")
    .isIn(["ADMIN", "TEAM_LEADER", "TEAM_MEMBER"])
    .withMessage("Role must be ADMIN, TEAM_LEADER, or TEAM_MEMBER."),

  body("status")
    .optional()
    .isIn(Object.values(USER_STATUS))
    .withMessage(`Status must be one of: ${Object.values(USER_STATUS).join(", ")}.`),

  body("teamLeaderId")
    .optional({ values: "falsy" })
    .trim()
    .notEmpty()
    .withMessage("teamLeaderId must be a valid user id when provided."),

  body("clientIds")
    .optional()
    .isArray()
    .withMessage("clientIds must be an array.")
    .custom((value) => {
      if (value && !value.every((id) => Number.isInteger(id))) {
        throw new Error("Each client ID must be an integer.");
      }
      return true;
    }),
];

const listUsersValidator = [
  query("status")
    .optional()
    .isIn(Object.values(USER_STATUS))
    .withMessage(`Status must be one of: ${Object.values(USER_STATUS).join(", ")}.`),

  query("page").optional().isInt({ min: 1 }).withMessage("page must be >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
];

const idParamValidator = [
  param("id").trim().notEmpty().withMessage("User id is required."),
];

const updateUserValidator = [
  param("id").trim().notEmpty().withMessage("User id is required."),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty.")
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters."),

  body("email")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Email cannot be empty.")
    .isEmail()
    .withMessage("Enter a valid email address.")
    .normalizeEmail(),

  body("phone")
    .optional({ values: "null" })
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Phone must be between 8 and 20 characters."),

  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one digit."),

  body("role")
    .optional()
    .isIn(["ADMIN", "TEAM_LEADER", "TEAM_MEMBER"])
    .withMessage("Role must be ADMIN, TEAM_LEADER, or TEAM_MEMBER."),

  body("teamLeaderId")
    .optional({ values: "falsy" })
    .trim()
    .notEmpty()
    .withMessage("teamLeaderId must be a valid user id when provided."),

  body("clientIds")
    .optional()
    .isArray()
    .withMessage("clientIds must be an array.")
    .custom((value) => {
      if (value && !value.every((id) => Number.isInteger(id))) {
        throw new Error("Each client ID must be an integer.");
      }
      return true;
    }),

  body().custom((value) => {
    const allowedFields = ["name", "email", "phone", "password", "role", "teamLeaderId", "clientIds"];
    const hasUpdate = allowedFields.some((field) => value[field] !== undefined);
    if (!hasUpdate) {
      throw new Error("At least one field is required to update.");
    }
    return true;
  }),
];

module.exports = {
  createUserValidator,
  listUsersValidator,
  idParamValidator,
  updateUserValidator,
};

