const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate");
const { checkPermission, checkAnyPermission } = require("../middleware/rbac");
const tasksController = require("./tasks.controller");
const {
  createTaskValidator,
  updateStatusValidator,
  reassignTaskValidator,
  listTasksValidator,
  addChecklistItemValidator,
  idParamValidator,
} = require("./tasks.validator");

router.use(authenticate);


/** List active team members eligible for assignment */
router.get(
  "/assignees",
  checkAnyPermission("task_assign_any", "task_assign_team"),
  tasksController.listAssignableUsers
);

/** GET task list */
router.get(
  "/",
  checkAnyPermission("view_all_tasks", "view_own_tasks", "view_operational_reports"),
  listTasksValidator,
  tasksController.listTasks
);

/** POST /api/task — Create and assign a task */
router.post(
  "/create_Task",
  checkPermission("create_task"),
  createTaskValidator,
  tasksController.createTask
);

/** GET /api/task/:id — Get single task */
router.get(
  "/:id",
  checkAnyPermission("view_all_tasks", "view_own_tasks", "view_operational_reports"),
  idParamValidator,
  tasksController.getTask
);

/** PATCH /api/task/:id/status — Update task status */
router.patch(
  "/:id/status",
  checkAnyPermission(
    "update_task_status",
    "mark_task_complete",
    "approve_task",
    "approve_task_if_enabled",
    "change_due_date",
    "request_due_date_change"
  ),
  updateStatusValidator,
  tasksController.updateTaskStatus
);

/** PATCH /api/task/:id/reassign — Reassign task to another team member */
router.patch(
  "/:id/reassign",
  checkAnyPermission("reassign_task", "reassign_task_within_team"),
  reassignTaskValidator,
  tasksController.reassignTask
);

// STATUS HISTORY

/** GET /api/task/:id/history */
router.get(
  "/:id/history",
  checkAnyPermission("view_all_tasks", "view_own_tasks", "view_operational_reports"),
  idParamValidator,
  tasksController.getTaskStatusHistory
);

// CHECKLIST

/** POST /api/task/:id/checklist — Add a checklist item */
router.post(
  "/:id/checklist",
  checkAnyPermission(
    "create_task",
    "update_task_status",
    "mark_task_complete",
    "view_own_tasks"
  ),
  addChecklistItemValidator,
  tasksController.addChecklistItem
);

/** PATCH /api/task/:id/checklist/:checklistId/toggle — Toggle completion */
router.patch(
  "/:id/checklist/:checklistId/toggle",
  checkAnyPermission(
    "create_task",
    "update_task_status",
    "mark_task_complete",
    "view_own_tasks"
  ),
  tasksController.toggleChecklistItem
);

/** DELETE /api/task/:id/checklist/:checklistId — Remove checklist item */
router.delete(
  "/:id/checklist/:checklistId",
  checkAnyPermission("create_task", "update_task_status"),
  tasksController.deleteChecklistItem
);

module.exports = router;