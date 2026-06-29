const { validationResult } = require("express-validator");
const { successResponse, errorResponse } = require("../utils/response.utils");
const dueDatesService = require("./Duedates.service");

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, "Validation failed.", 422, errors.array());
    return true;
  }
  return false;
};

/** GET /api/due-dates/dashboard */
const getDashboard = async (req, res) => {
  try {
    const data = await dueDatesService.getDueDateDashboard(req.user);
    return successResponse(res, data, "Due date dashboard fetched.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

// ─── Due Date Change

/** PATCH /api/due-dates/tasks/:taskId */
const changeTaskDueDate = async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const result = await dueDatesService.changeTaskDueDate(
      req.user,
      req.params.taskId,
      req.body
    );
    return successResponse(res, result, "Task due date updated successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/** GET /api/due-dates/tasks/:taskId/history */
const getDueDateHistory = async (req, res) => {
  try {
    const history = await dueDatesService.getDueDateHistory(req.user, req.params.taskId);
    return successResponse(res, { history }, "Due date history fetched.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

// ─── Reminders 

/** GET /api/due-dates/reminders/my */
const getMyReminders = async (req, res) => {
  try {
    const { upcoming, page, limit } = req.query;
    const data = await dueDatesService.listMyReminders(req.user, {
      upcoming: upcoming !== "false",
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
    return successResponse(res, data, "Reminders fetched.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/** GET /api/due-dates/tasks/:taskId/reminders */
const getTaskReminders = async (req, res) => {
  try {
    const reminders = await dueDatesService.listRemindersByTask(req.user, req.params.taskId);
    return successResponse(res, { reminders }, "Task reminders fetched.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/** POST /api/due-dates/tasks/:taskId/reminders */
const createReminder = async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const reminder = await dueDatesService.createReminder(req.user, req.params.taskId, req.body);
    return successResponse(res, { reminder }, "Reminder created.", 201);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/** PATCH /api/due-dates/reminders/:reminderId */
const updateReminder = async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const reminder = await dueDatesService.updateReminder(req.user, req.params.reminderId, req.body);
    return successResponse(res, { reminder }, "Reminder updated.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/** DELETE /api/due-dates/reminders/:reminderId */
const cancelReminder = async (req, res) => {
  try {
    await dueDatesService.cancelReminder(req.user, req.params.reminderId);
    return successResponse(res, null, "Reminder cancelled.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

module.exports = {
  getDashboard,
  changeTaskDueDate,
  getDueDateHistory,
  getMyReminders,
  getTaskReminders,
  createReminder,
  updateReminder,
  cancelReminder,
};