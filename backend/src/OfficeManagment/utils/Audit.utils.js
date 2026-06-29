const prisma = require("../../shared/prisma");

/**
 * Record an audit log entry.
 * @param {object} opts
 * @param {number|null} opts.actorId - User performing the action
 * @param {string} opts.action      - e.g. "USER_CREATED", "TASK_STATUS_CHANGED"
 * @param {string} opts.entityType  - e.g. "User", "Task", "Invoice"
 * @param {string|number|null} opts.entityId
 * @param {object|null} opts.oldValue
 * @param {object|null} opts.newValue
 * @param {string|null} opts.ipAddress
 * @param {string|null} opts.userAgent
 */
const audit = async ({
  actorId = null,
  action,
  entityType,
  entityId = null,
  oldValue = null,
  newValue = null,
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        oldValue,
        newValue,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    // Audit failures should never crash the main flow
    console.error("[AuditLog] Failed to record:", err.message);
  }
};

module.exports = { audit };