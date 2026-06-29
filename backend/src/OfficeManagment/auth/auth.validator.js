const { body } = require("express-validator");
const { USER_STATUS } = require("../utils/enums");

const passwordRules = body("password")
  .notEmpty()
  .withMessage("Password is required.")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters.")
  .matches(/[A-Z]/)
  .withMessage("Password must contain at least one uppercase letter.")
  .matches(/[0-9]/)
  .withMessage("Password must contain at least one digit.");

const newPasswordRules = body("newPassword")
  .notEmpty()
  .withMessage("New password is required.")
  .isLength({ min: 8 })
  .withMessage("New password must be at least 8 characters.")
  .matches(/[A-Z]/)
  .withMessage("New password must contain at least one uppercase letter.")
  .matches(/[0-9]/)
  .withMessage("New password must contain at least one digit.");

const loginValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Enter a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required."),

  body("userRole")
    .optional()
    .isString().withMessage("userRole must be a string")
    .trim()
    .notEmpty().withMessage("userRole cannot be empty")
];

const changePasswordValidator = [
  body("oldPassword")
    .notEmpty().withMessage("Current password is required."),

  newPasswordRules,
];

const forgotPasswordValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Enter a valid email address.")
    .normalizeEmail(),
];

const resetPasswordValidator = [
  body("token").trim().notEmpty().withMessage("Reset token is required."),
  newPasswordRules,
];

module.exports = {
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
};
