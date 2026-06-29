const { TASK_STATUS } = require("../utils/enums");

const STATUS_TRANSITIONS = Object.freeze({
  [TASK_STATUS.DRAFT]: [TASK_STATUS.ASSIGNED, TASK_STATUS.CANCELLED],
  [TASK_STATUS.ASSIGNED]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.CANCELLED, TASK_STATUS.OVERDUE],
  [TASK_STATUS.IN_PROGRESS]: [TASK_STATUS.SUBMITTED, TASK_STATUS.CANCELLED, TASK_STATUS.OVERDUE],
  [TASK_STATUS.SUBMITTED]: [TASK_STATUS.APPROVED, TASK_STATUS.REJECTED, TASK_STATUS.COMPLETED, TASK_STATUS.CANCELLED],
  [TASK_STATUS.REJECTED]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.CANCELLED],
  [TASK_STATUS.APPROVED]: [TASK_STATUS.COMPLETED],
  [TASK_STATUS.OVERDUE]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.SUBMITTED, TASK_STATUS.CANCELLED],
  [TASK_STATUS.COMPLETED]: [],
  [TASK_STATUS.CANCELLED]: [],
});

const canCreateTask = (actor) => actor.permissions?.includes("create_task");

const canReassignTask = (actor) =>
  actor.permissions?.includes("reassign_task") ||
  actor.permissions?.includes("reassign_task_within_team");

const canApproveTask = (actor) =>
  actor.permissions?.includes("approve_task") ||
  actor.permissions?.includes("approve_task_if_enabled");

const canChangeDueDate = (actor) => actor.permissions?.includes("change_due_date");

const canRequestDueDateChange = (actor) =>
  actor.permissions?.includes("request_due_date_change");

const isAssignee = (task, userId) => task.assignedToId === userId;

const isTeamMemberOfLeader = (assignee, leaderId) =>
  assignee?.teamLeaderId === leaderId;

const getAllowedTransitions = (fromStatus, requiresApproval = true) => {
  const allowed = [...(STATUS_TRANSITIONS[fromStatus] || [])];
  if (fromStatus === TASK_STATUS.SUBMITTED && requiresApproval) {
    return allowed.filter((s) => s !== TASK_STATUS.COMPLETED);
  }
  return allowed;
};

const assertStatusTransition = (fromStatus, toStatus, requiresApproval = true) => {
  const allowed = getAllowedTransitions(fromStatus, requiresApproval);
  if (!allowed.includes(toStatus)) {
    const err = new Error(
      `Invalid status transition from ${fromStatus} to ${toStatus}.`
    );
    err.statusCode = 400;
    throw err;
  }
};


const assertCanSetStatus = ({ actor, task, userId, toStatus, requiresApproval }) => {
  const assignee = isAssignee(task, userId);

  if (toStatus === TASK_STATUS.APPROVED || toStatus === TASK_STATUS.REJECTED) {
    if (!canApproveTask(actor)) {
      const err = new Error("You do not have permission to approve or reject tasks.");
      err.statusCode = 403;
      throw err;
    }
    if (actor.permissions?.includes("approve_task_if_enabled") && requiresApproval === false) {
      const err = new Error("Task approval is not enabled for this task.");
      err.statusCode = 403;
      throw err;
    }
    if (task.status !== TASK_STATUS.SUBMITTED) {
      const err = new Error("Only submitted tasks can be approved or rejected.");
      err.statusCode = 400;
      throw err;
    }
    return;
  }

  // If actor can update tasks generally, allow (RBAC-based).
  if (actor.permissions?.includes("update_task_status")) return;

  // Assignee-only behavior for anyone without update_task_status:
  if (!assignee) {
    const err = new Error("You can only update tasks assigned to you.");
    err.statusCode = 403;
    throw err;
  }

  const allowedForAssignee = [
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.SUBMITTED,
    TASK_STATUS.COMPLETED,
  ];
  if (!allowedForAssignee.includes(toStatus)) {
    const err = new Error("You can only update progress or submit your assigned task.");
    err.statusCode = 403;
    throw err;
  }

  if (toStatus === TASK_STATUS.COMPLETED && requiresApproval) {
    const err = new Error(
      "This task requires approval. Submit it for review instead of marking completed directly."
    );
    err.statusCode = 400;
    throw err;
  }
};    

module.exports = {
  canCreateTask,
  canReassignTask,
  canApproveTask,
  canChangeDueDate,
  canRequestDueDateChange,
  isAssignee,
  isTeamMemberOfLeader,
  assertStatusTransition,
  assertCanSetStatus,
  STATUS_TRANSITIONS,
};
