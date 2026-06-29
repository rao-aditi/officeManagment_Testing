
const { body, param, query } = require("express-validator");

const changeDueDateValidator = [
  param("taskId")
    .trim()
    .notEmpty()
    .isUUID()
    .withMessage("taskId must be a valid UUID."),
  body("dueDate")
    .notEmpty()
    .withMessage("dueDate is required.")
    .isISO8601()
    .withMessage("dueDate must be a valid ISO 8601 date.")
    .toDate(),
  body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("reason must not exceed 500 characters."),
];

const createReminderValidator = [
  param("taskId")
    .trim()
    .notEmpty()
    .isUUID()
    .withMessage("taskId must be a valid UUID."),
  body("remindAt")
    .notEmpty()
    .withMessage("remindAt is required.")
    .isISO8601()
    .withMessage("remindAt must be a valid ISO 8601 date-time.")
    .toDate(),
  body("message")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("message must not exceed 500 characters."),
  body("userId")
    .optional()
    .trim()
    .isUUID()
    .withMessage("userId must be a valid UUID."),
];

const updateReminderValidator = [
  param("reminderId")
    .trim()
    .notEmpty()
    .isUUID()
    .withMessage("reminderId must be a valid UUID."),
  body("remindAt")
    .optional()
    .isISO8601()
    .withMessage("remindAt must be a valid ISO 8601 date-time.")
    .toDate(),
  body("message")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("message must not exceed 500 characters."),
];

module.exports = {
  changeDueDateValidator,
  createReminderValidator,
  updateReminderValidator,
};