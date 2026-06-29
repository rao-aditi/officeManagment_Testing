const { validationResult } = require("express-validator");
const { successResponse, errorResponse } = require("../utils/response.utils");
const tasksService = require("./tasks.service");

// HELPER
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, "Validation failed.", 422, errors.array());
    return true;
  }
  return false;
};


// TASK CRUD

/** Create & assign a task */
const createTask = async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const task = await tasksService.createTask(req.user, req.body);
    return successResponse(res, { task }, "Task created and assigned successfully.", 201);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/** GET /api/task/  — List tasks  */
const listTasks = async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const { status, client_Id, assignedToId, priority, taskType, page, limit } = req.query;
    const result = await tasksService.listTasks(req.user, {
      status,
      client_Id,
      assignedToId,
      priority,
      taskType,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
    return successResponse(res, result, "Tasks fetched successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/** GET /api/task/:id  — Get single task */
const getTask = async (req, res) => {
  try {
    const task = await tasksService.getTask(req.user, req.params.id);
    return successResponse(res, { task }, "Task fetched successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/** GET /api/task/assignees  — List assignable users */
const listAssignableUsers = async (req, res) => {
  try {
    const users = await tasksService.listAssignableUsers(req.user);
    return successResponse(res, { users }, "Assignable users fetched successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/** PATCH /api/task/:id/status  — Update task status */
const updateTaskStatus = async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const task = await tasksService.updateTaskStatus(req.user, req.params.id, req.body);
    return successResponse(res, { task }, "Task status updated successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/** PATCH /api/task/:id/reassign  — Reassign task */
const reassignTask = async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const task = await tasksService.reassignTask(req.user, req.params.id, req.body);
    return successResponse(res, { task }, "Task reassigned successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};


// CHECKLIST

/** POST /api/task/:id/checklist  — Add checklist item */
const addChecklistItem = async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const item = await tasksService.addChecklistItem(req.user, req.params.id, req.body);
    return successResponse(res, { item }, "Checklist item added.", 201);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/** PATCH /api/task/:id/checklist/:checklistId/toggle  — Toggle checklist item */
const toggleChecklistItem = async (req, res) => {
  try {
    const item = await tasksService.toggleChecklistItem(
      req.user,
      req.params.id,
      req.params.checklistId
    );
    return successResponse(res, { item }, "Checklist item toggled.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/** DELETE /api/task/:id/checklist/:checklistId  — Delete checklist item */
const deleteChecklistItem = async (req, res) => {
  try {
    await tasksService.deleteChecklistItem(req.user, req.params.id, req.params.checklistId);
    return successResponse(res, null, "Checklist item deleted.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

// STATUS HISTORY

/** GET /api/task/:id/history  — Get task status history */
const getTaskStatusHistory = async (req, res) => {
  try {
    const history = await tasksService.getTaskStatusHistory(req.user, req.params.id);
    return successResponse(res, { history }, "Task history fetched.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

module.exports = {
  createTask,
  listTasks,
  getTask,
  listAssignableUsers,
  updateTaskStatus,
  reassignTask,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  getTaskStatusHistory,
};