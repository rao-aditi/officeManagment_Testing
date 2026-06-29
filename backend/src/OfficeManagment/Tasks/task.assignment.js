const prisma = require("../../shared/prisma");
const { USER_STATUS } = require("../utils/enums");

/**
 * Dynamic, permission-based assignment policy.
 *   - Actor must have an assignment permission.
 *   - Assignee must have "task_receive" to be assignable.
 * - Team scoping uses the existing hierarchy field `teamLeaderId`.
 *   Future org models can extend this check without rewriting the task module.
 */

const PERM = Object.freeze({
  TASK_RECEIVE: "task_receive",
  TASK_ASSIGN_ANY: "task_assign_any",
  TASK_ASSIGN_TEAM: "task_assign_team",
});

const hasPerm = (actor, perm) => Boolean(actor?.permissions?.includes(perm));

const assertAssignableUser = (assignee) => {
  if (!assignee) {
    const err = new Error("Assigned user not found.");
    err.statusCode = 404;
    throw err;
  }
  if (assignee.status !== USER_STATUS.ACTIVE) {
    const err = new Error("Task can only be assigned to an active user.");
    err.statusCode = 400;
    throw err;
  }
  const receivePerms = assignee.permissions || [];
  if (!receivePerms.includes(PERM.TASK_RECEIVE)) {
    const err = new Error(
      `This user cannot receive tasks (missing permission: ${PERM.TASK_RECEIVE}).`
    );
    err.statusCode = 400;
    throw err;
  }
};

const assertActorCanAssignTo = ({ actor, assignee }) => {
  if (hasPerm(actor, PERM.TASK_ASSIGN_ANY)) return;

  if (hasPerm(actor, PERM.TASK_ASSIGN_TEAM)) {
    // Team scope based on existing hierarchy relationship.
    if (assignee.teamLeaderId !== actor.id) {
      const err = new Error("You can only assign tasks within your team.");
      err.statusCode = 403;
      throw err;
    }
    return;
  }

  const err = new Error("You do not have permission to assign tasks.");
  err.statusCode = 403;
  throw err;
};

const assertActiveAssignee = async (assignedToId, { teamLeaderId } = {}) => {
  const user = await prisma.user.findUnique({
    where: { id: assignedToId },
    select: {
      id: true,
      status: true,
      teamLeaderId: true,
      roleRef: {
        select: {
          rolePermissions: {
            where: { permission: { isActive: true } },
            select: { permission: { select: { key: true } } },
          },
        },
      },
    },
  });

  const assignee = user
    ? {
        id: user.id,
        status: user.status,
        teamLeaderId: user.teamLeaderId,
        permissions:
          user.roleRef?.rolePermissions?.map((rp) => rp.permission.key) || [],
      }
    : null;

  assertAssignableUser(assignee);

  if (teamLeaderId && assignee.teamLeaderId !== teamLeaderId) {
    const err = new Error("You can only reassign tasks within your team.");
    err.statusCode = 403;
    throw err;
  }

  return assignee;
};

module.exports = {
  PERM,
  assertAssignableUser,
  assertActorCanAssignTo,
  assertActiveAssignee,
};

