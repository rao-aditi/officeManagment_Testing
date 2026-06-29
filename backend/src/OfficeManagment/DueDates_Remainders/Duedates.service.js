const prisma = require("../../shared/prisma");
const { audit } = require("../utils/Audit.utils");
const { TASK_STATUS, REMINDER_STATUS } = require("../utils/enums");
const { canChangeDueDate, canRequestDueDateChange } = require("../Tasks/task.permissions");


// REMINDER TYPES
const REMINDER_TYPES = Object.freeze({
  THREE_DAYS_BEFORE: "THREE_DAYS_BEFORE",
  ONE_DAY_BEFORE: "ONE_DAY_BEFORE",
  ON_DUE_DATE: "ON_DUE_DATE",
  OVERDUE: "OVERDUE",
  CUSTOM: "CUSTOM",
});

const getReminderDisplayMessage = (reminder) => {
  if (!reminder?.task?.dueDate) {
    return reminder.message;
  }

  if (reminder.reminderType === REMINDER_TYPES.CUSTOM) {
    return reminder.message;
  }

  const dueDate = new Date(reminder.task.dueDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (due - today) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Your task is due today.";
  if (diffDays === 1) return "Your task is due tomorrow.";
  if (diffDays === 3) return "Your task is due in 3 days.";
  if (diffDays > 1) return `Your task is due in ${diffDays} days.`;

  return reminder.message;
};

/** Real Client columns only — `legalName` is shaped for API responses */
const clientSelectForReminder = {
  id: true,
  code: true,
  name: true,
  businessName: true,
  firstName: true,
  middleName: true,
  lastName: true,
};

const shapeReminderClient = (client) => {
  if (!client) return client;
  const fullName = [client.firstName, client.middleName, client.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return {
    ...client,
    clientCode: client.code,
    legalName: client.name,
    displayName: client.businessName || client.name || fullName || null,
  };
};

const shapeReminderTask = (task) => {
  if (!task) return task;
  return {
    ...task,
    client: shapeReminderClient(task.client),
  };
};

const shapeRemindersWithTask = (reminders) =>
  reminders.map((r) => ({
    ...r,
    message: getReminderDisplayMessage(r),
    task: shapeReminderTask(r.task),
  }));

const getReminderById = async (id) => {
  const reminder = await prisma.taskReminder.findUnique({
    where: { id },
    include: {
      task: {
        select: {
          id: true, title: true, status: true,
          assignedToId: true, assignedById: true,
          dueDate: true,
        },
      },
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!reminder) {
    const err = new Error("Reminder not found.");
    err.statusCode = 404;
    throw err;
  }
  return reminder;
};

/**
 * Guard: can actor manage this reminder?
 */
const assertReminderAccess = (actor, reminder) => {
  const role = actor.role?.toUpperCase();
  if (role === "ADMIN" || role === "SUPER_ADMIN") return;

  // TL: must own the related task
  if (role === "TEAM_LEADER") {
    if (
      reminder.task.assignedById !== actor.id &&
      reminder.userId !== actor.id
    ) {
      const err = new Error("You do not have access to this reminder.");
      err.statusCode = 403;
      throw err;
    }
    return;
  }

  // TEAM_MEMBER: only their own reminder
  if (reminder.userId !== actor.id) {
    const err = new Error("You do not have access to this reminder.");
    err.statusCode = 403;
    throw err;
  }
};

// CREATE REMINDER
const createReminder = async (actor, taskId, data) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true, title: true, status: true,
      assignedToId: true, assignedById: true, dueDate: true,
    },
  });

  if (!task) {
    const err = new Error("Task not found.");
    err.statusCode = 404;
    throw err;
  }

  if ([TASK_STATUS.COMPLETED, TASK_STATUS.CANCELLED].includes(task.status)) {
    const err = new Error("Cannot add reminders to completed or cancelled tasks.");
    err.statusCode = 400;
    throw err;
  }

  const remindAt = new Date(data.remindAt);
  if (remindAt <= new Date()) {
    const err = new Error("remindAt must be a future date/time.");
    err.statusCode = 400;
    throw err;
  }

  // Determine target user for the reminder
  const role = actor.role?.toUpperCase();
  let targetUserId;
  if (data.userId && (role === "ADMIN" || role === "SUPER_ADMIN" || role === "TEAM_LEADER")) {
    targetUserId = data.userId;
  } else {
    targetUserId = actor.id;
  }

  const reminder = await prisma.taskReminder.create({
    data: {
      taskId,
      userId: targetUserId,
      remindAt,
      reminderType: REMINDER_TYPES.CUSTOM,
      message: data.message || `Reminder for task: ${task.title}`,
      isActive: true,
      status: REMINDER_STATUS.PENDING,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      task: { select: { id: true, title: true, dueDate: true } },
    },
  });

  await audit({
    actorId: actor.id,
    action: "REMINDER_CREATED",
    entityType: "TaskReminder",
    entityId: reminder.id,
    newValue: { taskId, remindAt: remindAt.toISOString(), targetUserId },
  });

  return reminder;
};

// LIST REMINDERS
const listRemindersByTask = async (actor, taskId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, assignedToId: true, assignedById: true },
  });
  if (!task) {
    const err = new Error("Task not found.");
    err.statusCode = 404;
    throw err;
  }

  const role = actor.role?.toUpperCase();
  const whereUser =
    role === "ADMIN" || role === "SUPER_ADMIN"
      ? {}
      : role === "TEAM_LEADER"
        ? { OR: [{ userId: actor.id }, { task: { assignedById: actor.id } }] }
        : { userId: actor.id };

  return prisma.taskReminder.findMany({
    where: { taskId, ...whereUser },
    orderBy: { remindAt: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
};

/**
 * List all upcoming reminders for the current actor (My Reminders).
 */
const listMyReminders = async (actor, { upcoming = true, page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const now = new Date();

  const where = {
    userId: actor.id,
    isActive: true,
    ...(upcoming ? { remindAt: { gte: now }, status: REMINDER_STATUS.PENDING } : {}),
  };

  const [reminders, total] = await Promise.all([
    prisma.taskReminder.findMany({
      where,
      orderBy: { remindAt: "asc" },
      skip,
      take: limit,
      include: {
        task: {
          select: {
            id: true, title: true, status: true,
            dueDate: true, priority: true,
            client: { select: clientSelectForReminder },
          },
        },
      },
    }),
    prisma.taskReminder.count({ where }),
  ]);

  return {
    reminders: shapeRemindersWithTask(reminders),
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// UPDATE / CANCEL REMINDER
const updateReminder = async (actor, reminderId, { remindAt, message }) => {
  const reminder = await getReminderById(reminderId);
  assertReminderAccess(actor, reminder);

  if (reminder.status !== REMINDER_STATUS.PENDING) {
    const err = new Error("Only pending reminders can be updated.");
    err.statusCode = 400;
    throw err;
  }

  if (reminder.reminderType !== REMINDER_TYPES.CUSTOM) {
    const err = new Error("Only custom reminders can be manually updated.");
    err.statusCode = 400;
    throw err;
  }

  const newRemindAt = remindAt ? new Date(remindAt) : undefined;
  if (newRemindAt && newRemindAt <= new Date()) {
    const err = new Error("remindAt must be a future date/time.");
    err.statusCode = 400;
    throw err;
  }

  const updated = await prisma.taskReminder.update({
    where: { id: reminderId },
    data: {
      ...(newRemindAt ? { remindAt: newRemindAt } : {}),
      ...(message ? { message } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      task: { select: { id: true, title: true } },
    },
  });

  return updated;
};

/**
 * Cancel (soft-delete) a reminder.
 */
const cancelReminder = async (actor, reminderId) => {
  const reminder = await getReminderById(reminderId);
  assertReminderAccess(actor, reminder);

  if (reminder.status === REMINDER_STATUS.CANCELLED) {
    const err = new Error("Reminder is already cancelled.");
    err.statusCode = 400;
    throw err;
  }

  const updated = await prisma.taskReminder.update({
    where: { id: reminderId },
    data: { status: REMINDER_STATUS.CANCELLED, isActive: false },
  });

  await audit({
    actorId: actor.id,
    action: "REMINDER_CANCELLED",
    entityType: "TaskReminder",
    entityId: reminderId,
  });

  return updated;
};

// DUE DATE MANAGEMENT
const changeTaskDueDate = async (actor, taskId, { dueDate, reason }) => {
  if (!canChangeDueDate(actor) && !canRequestDueDateChange(actor)) {
    const err = new Error("You do not have permission to change due dates.");
    err.statusCode = 403;
    throw err;
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    const err = new Error("Task not found.");
    err.statusCode = 404;
    throw err;
  }

  if ([TASK_STATUS.COMPLETED, TASK_STATUS.CANCELLED].includes(task.status)) {
    const err = new Error("Cannot change due date of a completed or cancelled task.");
    err.statusCode = 400;
    throw err;
  }

  const newDueDate = new Date(dueDate);
  const oldDueDate = task.dueDate;

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.task.update({
      where: { id: taskId },
      data: { dueDate: newDueDate },
    });

    // Audit trail for due date change
    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: "TASK_DUE_DATE_CHANGED",
        entityType: "Task",
        entityId: taskId,
        oldValue: { dueDate: oldDueDate?.toISOString() || null },
        newValue: { dueDate: newDueDate.toISOString(), reason: reason || null },
      },
    });

    return result;
  });

  // Cancel old reminders and reschedule
  await prisma.taskReminder.updateMany({
    where: {
      taskId,
      status: REMINDER_STATUS.PENDING,
      reminderType: { not: REMINDER_TYPES.CUSTOM },
    },
    data: { status: REMINDER_STATUS.CANCELLED, isActive: false },
  });

  if (task.assignedToId) {
    await scheduleDefaultReminders(taskId, newDueDate, task.assignedToId);
  }

  return {
    task: updated,
    oldDueDate: oldDueDate?.toISOString() || null,
    newDueDate: newDueDate.toISOString(),
  };
};

/**
 * Get full due-date change history for a task from audit log.
 */
const getDueDateHistory = async (actor, taskId) => {
  const role = actor.role?.toUpperCase();

  // Verify task exists and actor has visibility
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, assignedToId: true, assignedById: true },
  });
  if (!task) {
    const err = new Error("Task not found.");
    err.statusCode = 404;
    throw err;
  }

  if (role === "TEAM_MEMBER" && task.assignedToId !== actor.id) {
    const err = new Error("Access denied.");
    err.statusCode = 403;
    throw err;
  }

  return prisma.auditLog.findMany({
    where: {
      entityType: "Task",
      entityId: taskId,
      action: "TASK_DUE_DATE_CHANGED",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      actorId: true,
      oldValue: true,
      newValue: true,
      createdAt: true,
    },
  });
};

// OVERDUE PROCESSING (CRON)
const processOverdueTasks = async () => {
  const now = new Date();

  const overdueIds = await prisma.task.findMany({
    where: {
      status: { notIn: [TASK_STATUS.COMPLETED, TASK_STATUS.CANCELLED, TASK_STATUS.OVERDUE] },
      dueDate: { lt: now },
    },
    select: { id: true, status: true, assignedToId: true, assignedById: true },
  });

  if (overdueIds.length === 0) return { updated: 0 };

  const ids = overdueIds.map((t) => t.id);

  await prisma.$transaction(async (tx) => {
    await tx.task.updateMany({
      where: { id: { in: ids } },
      data: { status: TASK_STATUS.OVERDUE },
    });

    await tx.taskStatusHistory.createMany({
      data: ids
        .map((taskId) => {
          const task = overdueIds.find((t) => t.id === taskId);
          return {
            taskId,
            fromStatus: task?.status,
            toStatus: TASK_STATUS.OVERDUE,
            changedById: task?.assignedToId || task?.assignedById,
            remarks: "Automatically marked overdue by system scheduler",
          };
        })
        .filter((entry) => entry.changedById),
      skipDuplicates: true,
    });
  });

  // Create OVERDUE reminders for assignees
  const overdueReminderData = overdueIds
    .filter((t) => t.assignedToId)
    .map((t) => ({
      taskId: t.id,
      userId: t.assignedToId,
      remindAt: now,
      reminderType: REMINDER_TYPES.OVERDUE,
      message: "This task is now overdue. Please take action.",
      status: REMINDER_STATUS.PENDING,
      isActive: true,
    }));

  if (overdueReminderData.length > 0) {
    await prisma.taskReminder.createMany({
      data: overdueReminderData,
      skipDuplicates: true,
    });
  }

  return { updated: ids.length, taskIds: ids };
};

const processPendingReminders = async () => {
  const now = new Date();

  const dueReminders = await prisma.taskReminder.findMany({
    where: {
      status: REMINDER_STATUS.PENDING,
      isActive: true,
      remindAt: { lte: now },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      task: {
        select: {
          id: true, title: true, dueDate: true,
          status: true, priority: true,
          client: { select: clientSelectForReminder },
        },
      },
    },
    take: 200,
  });

  if (dueReminders.length === 0) return { processed: 0, reminders: [] };

  const processedIds = [];

  for (const reminder of dueReminders) {
    try {
      await prisma.taskReminder.update({
        where: { id: reminder.id },
        data: {
          status: REMINDER_STATUS.SENT,
          sentAt: now,
          isActive: false,
        },
      });

      processedIds.push(reminder.id);
    } catch (err) {
      // Mark failed without crashing the batch
      console.error(`[Reminder] Failed to process ${reminder.id}:`, err.message);
      await prisma.taskReminder.update({
        where: { id: reminder.id },
        data: { status: REMINDER_STATUS.FAILED },
      }).catch(() => { });
    }
  }

  return { processed: processedIds.length, reminderIds: processedIds };
};

// AUTO-SCHEDULE HELPERS (shared with tasks.service)
const scheduleDefaultReminders = async (taskId, dueDate, userId) => {
  if (!userId || !dueDate) return;

  const now = new Date();
  const offsets = [
    { days: 3, type: REMINDER_TYPES.THREE_DAYS_BEFORE, label: "in 3 days" },
    { days: 1, type: REMINDER_TYPES.ONE_DAY_BEFORE, label: "tomorrow" },
    { days: 0, type: REMINDER_TYPES.ON_DUE_DATE, label: "today" },
  ];

  const reminders = offsets
    .map(({ days, type, label }) => {
      const remindAt = new Date(dueDate);
      remindAt.setDate(remindAt.getDate() - days);
      remindAt.setHours(9, 0, 0, 0); // 9 AM
      return { remindAt, type, label };
    })
    .filter(({ remindAt }) => remindAt > now);

  if (reminders.length === 0) return;

  await prisma.taskReminder.createMany({
    data: reminders.map(({ remindAt, type, label }) => ({
      taskId,
      userId,
      remindAt,
      reminderType: type,
      message: `Reminder: Your task is due ${label}.`,
      status: REMINDER_STATUS.PENDING,
      isActive: true,
    })),
    skipDuplicates: true,
  });
};

/* Get a dashboard summary of upcoming due dates / overdue tasks for the actor.*/
const getDueDateDashboard = async (actor) => {
  const role = actor.role?.toUpperCase();
  const now = new Date();
  const in3Days = new Date(now);
  in3Days.setDate(in3Days.getDate() + 3);
  const in7Days = new Date(now);
  in7Days.setDate(in7Days.getDate() + 7);

  const baseWhere =
    role === "ADMIN" || role === "SUPER_ADMIN"
      ? {}
      : role === "TEAM_LEADER"
        ? {
          OR: [
            { assignedById: actor.id },
            { assignedToId: actor.id },
            { assignedTo: { teamLeaderId: actor.id } },
          ],
        }
        : { assignedToId: actor.id };

  const overdueWhere = {
    AND: [
      baseWhere,
      {
        status: {
          notIn: [
            TASK_STATUS.COMPLETED,
            TASK_STATUS.CANCELLED,
          ],
        },
      },
      {
        OR: [
          { dueDate: { lt: now } },
          { status: TASK_STATUS.OVERDUE },
        ],
      },
    ],
  };

  const [overdue, dueToday, dueSoon, totalPending, upcomingReminders, upcomingTasks] = await Promise.all([
    // Overdue tasks
    prisma.task.count({
      where: overdueWhere,
    }),

    // Due today
    prisma.task.count({
      where: {
        ...baseWhere,
        status: { notIn: [TASK_STATUS.COMPLETED, TASK_STATUS.CANCELLED, TASK_STATUS.OVERDUE] },
        dueDate: {
          gte: new Date(now.toDateString()),
          lt: new Date(new Date(now.toDateString()).getTime() + 86400000),
        },
      },
    }),
    // Due in 3 days
    prisma.task.count({
      where: {
        ...baseWhere,
        status: { notIn: [TASK_STATUS.COMPLETED, TASK_STATUS.CANCELLED, TASK_STATUS.OVERDUE] },
        dueDate: { gte: now, lte: in3Days },
      },
    }),
    // Total open
    prisma.task.count({
      where: {
        ...baseWhere,
        status: {
          notIn: [TASK_STATUS.COMPLETED, TASK_STATUS.CANCELLED],
        },
      },
    }),
    // Upcoming reminders for actor
    prisma.taskReminder.findMany({
      where: {
        userId: actor.id,
        status: REMINDER_STATUS.PENDING,
        isActive: true,
        remindAt: { gte: now, lte: in7Days },
      },
      orderBy: { remindAt: "asc" },
      take: 10,
      include: {
        task: {
          select: {
            id: true, title: true, dueDate: true,
            priority: true, status: true,
            client: { select: clientSelectForReminder },
          },
        },
      },
    }),
    // Open tasks that are overdue or due within 7 days (shown when no reminders exist)
    prisma.task.findMany({
      where: {
        AND: [
          baseWhere,
          {
            status: {
              notIn: [
                TASK_STATUS.COMPLETED,
                TASK_STATUS.CANCELLED,
              ],
            },
          },
          {
            OR: [
              {
                dueDate: {
                  lt: now,
                },
              },
              {
                dueDate: {
                  gte: now,
                  lte: in7Days,
                },
              },
            ],
          },
        ],
      },
      orderBy: { dueDate: "asc" },
      take: 10,
      select: {
        id: true,
        title: true,
        dueDate: true,
        priority: true,
        status: true,
        client: {
          select: clientSelectForReminder,
        },
      },
    }),
  ]);

  return {
    summary: {
      overdue,
      dueToday,
      dueSoon,
      totalPending,
    },
    upcomingReminders: shapeRemindersWithTask(upcomingReminders),
    upcomingTasks: upcomingTasks.map((task) => ({
      ...shapeReminderTask(task),
      status:
        task.dueDate && new Date(task.dueDate) < now
          ? TASK_STATUS.OVERDUE
          : task.status,
    })),
  };
};

module.exports = {
  REMINDER_TYPES,
  createReminder,
  listRemindersByTask,
  listMyReminders,
  updateReminder,
  cancelReminder,
  changeTaskDueDate,
  getDueDateHistory,
  getDueDateDashboard,
  processOverdueTasks,
  processPendingReminders,
  scheduleDefaultReminders,
};