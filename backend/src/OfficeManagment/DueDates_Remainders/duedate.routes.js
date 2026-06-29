const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate");
const { checkAnyPermission } = require("../middleware/rbac");
const dueDatesController = require("./duedate.controller");
const {
  changeDueDateValidator,
  createReminderValidator,
  updateReminderValidator,
} = require("./Duedates.validator");

router.use(authenticate);

// DueDate Dashboard
router.get(
  "/dueDate_dashboard",
  checkAnyPermission("view_all_tasks", "view_own_tasks", "view_operational_reports"),
  dueDatesController.getDashboard
);

// Change task due date
router.patch(
  "/tasks/:taskId",
  checkAnyPermission("change_due_date", "request_due_date_change"),
  changeDueDateValidator,
  dueDatesController.changeTaskDueDate
);

// Due date change history
router.get(
  "/tasks/:taskId/history",
  checkAnyPermission("view_all_tasks", "view_own_tasks", "view_operational_reports"),
  dueDatesController.getDueDateHistory
);

// All reminders for a task
router.get(
  "/tasks/:taskId/reminders",
  checkAnyPermission("view_all_tasks", "view_own_tasks", "view_operational_reports"),
  dueDatesController.getTaskReminders
);

// Create custom reminder
router.post(
  "/tasks/:taskId/reminders",
  checkAnyPermission(
    "create_task",
    "update_task_status",
    "mark_task_complete",
    "view_own_tasks"
  ),
  createReminderValidator,
  dueDatesController.createReminder
);

// Current user's upcoming reminders
router.get(
  "/reminders/my",
  checkAnyPermission("view_all_tasks", "view_own_tasks", "view_operational_reports"),
  dueDatesController.getMyReminders
);

// Update custom reminder
router.patch(
  "/reminders/:reminderId",
  checkAnyPermission(
    "create_task",
    "update_task_status",
    "view_own_tasks"
  ),
  updateReminderValidator,
  dueDatesController.updateReminder
);

// Cancel reminder
router.delete(
  "/reminders/:reminderId",
  checkAnyPermission(
    "create_task",
    "update_task_status",
    "view_own_tasks"
  ),
  dueDatesController.cancelReminder
);

module.exports = router;