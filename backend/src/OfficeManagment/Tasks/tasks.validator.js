const { body, param, query } = require("express-validator");
const { TaskPriority, TaskStatus } = require("@prisma/client");
const priorityValues = Object.values(TaskPriority);
const statusValues = Object.values(TaskStatus);
const prisma = require("../../shared/prisma");

// CREATE TASK
const createTaskValidator = [
  body("client_Id")
    .notEmpty()
    .withMessage("client_Id is required.")
    .isInt({ min: 1 })
    .withMessage("client_Id must be a valid client id."),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("title is required.")
    .isLength({ min: 2, max: 300 })
    .withMessage("title must be 2–300 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("description must not exceed 2000 characters."),

    
  body("serviceTypeId")
    .notEmpty()
    .withMessage("serviceTypeId is required.")
    .isInt({ min: 1 })
    .withMessage("Invalid service type.")
    .custom(async (id) => {
      const serviceType = await prisma.serviceType.findUnique({
        where: { id: Number(id) },
      });

      if (!serviceType) {
        throw new Error("Service type not found.");
      }

      return true;
    }),

  body("assignedToId")
    .trim()
    .notEmpty()
    .withMessage("assignedToId is required.")
    .isUUID()
    .withMessage("assignedToId must be a valid UUID."),

  body("priority")
    .optional()
    .isIn(priorityValues)
    .withMessage(`priority must be one of: ${priorityValues.join(", ")}`),

  body("dueDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("dueDate must be a valid ISO 8601 date.")
    .toDate(),

  body("requiresApproval")
    .optional()
    .isBoolean()
    .withMessage("requiresApproval must be a boolean.")
    .toBoolean(),

  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("remarks must not exceed 1000 characters."),

  body("checklistItems")
    .optional()
    .isArray({ max: 20 })
    .withMessage("checklistItems must be an array of up to 20 items."),

  body("checklistItems.*")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Each checklist item must be a non-empty string.")
    .isLength({ max: 200 })
    .withMessage("Each checklist item must not exceed 200 characters."),
];

// UPDATE STATUS

const updateStatusValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Task id is required.")
    .isUUID()
    .withMessage("Task id must be a valid UUID."),

  body("status")
    .trim()
    .notEmpty()
    .withMessage("status is required.")
    .isIn(statusValues)
    .withMessage(`status must be one of: ${statusValues.join(", ")}`),

  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("remarks must not exceed 1000 characters."),

  body("dueDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("dueDate must be a valid ISO 8601 date.")
    .toDate(),
];

// REASSIGN TASK

const reassignTaskValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Task id is required.")
    .isUUID()
    .withMessage("Task id must be a valid UUID."),

  body("assignedToId")
    .trim()
    .notEmpty()
    .withMessage("assignedToId is required.")
    .isUUID()
    .withMessage("assignedToId must be a valid UUID."),

  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("remarks must not exceed 1000 characters."),
];

// LIST TASKS

const listTasksValidator = [
  query("status")
    .optional()
    .isIn(statusValues)
    .withMessage(`status must be one of: ${statusValues.join(", ")}`),

  query("client_Id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("client_Id must be a valid client id."),

  query("assignedToId")
    .optional()
    .trim()
    .isUUID()
    .withMessage("assignedToId must be a valid UUID."),

  query("priority")
    .optional()
    .isIn(priorityValues)
    .withMessage(`priority must be one of: ${priorityValues.join(", ")}`),


  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer.")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100.")
    .toInt(),
];

// CHECKLIST

const addChecklistItemValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Task id is required.")
    .isUUID()
    .withMessage("Task id must be a valid UUID."),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("title is required.")
    .isLength({ max: 200 })
    .withMessage("title must not exceed 200 characters."),
];

const idParamValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Task id is required.")
    .isUUID()
    .withMessage("Task id must be a valid UUID."),
];

module.exports = {
  createTaskValidator,
  updateStatusValidator,
  reassignTaskValidator,
  listTasksValidator,
  addChecklistItemValidator,
  idParamValidator,
};