const prisma = require("../../shared/prisma");
const { audit } = require("../utils/Audit.utils");
const {
  TASK_STATUS,
  USER_STATUS,
} = require("../utils/enums");
const {
  canCreateTask,
  canReassignTask,
  canChangeDueDate,
  canRequestDueDateChange,
  isAssignee,
  isTeamMemberOfLeader,
  assertStatusTransition,
  assertCanSetStatus,
} = require("./task.permissions");
const {
  assertAssignableUser,
  assertActorCanAssignTo,
  assertActiveAssignee,
} = require("./task.assignment");

const taskInclude = {
  client: {
    select: {
      id: true,
      code: true,
      name: true,
      businessName: true,
      firstName: true,
      middleName: true,
      lastName: true,
      status: true,
    },
  },

  serviceType: {
    select: {
      id: true,
      name: true,
      serviceCharges: true,
    },
  },

  assignedTo: {
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      roleRef: {
        select: {
          name: true,
        },
      },
    },
  },

  assignedBy: {
    select: {
      id: true,
      name: true,
      email: true,
      roleRef: {
        select: {
          name: true,
        },
      },
    },
  },
};

const normalizeclient_Id = (client_Id) => {
  const id = typeof client_Id === "string" ? parseInt(client_Id, 10) : client_Id;
  if (!Number.isInteger(id) || id < 1) {
    const err = new Error("client_Id must be a valid client id.");
    err.statusCode = 400;
    throw err;
  }
  return id;
};

const toTaskClientSnapshot = (client) => {
  if (!client) return null;
  return {
    id: client.id,
    code: client.code,
    name: client.name,
    businessName: client.businessName,
    firstName: client.firstName,
    middleName: client.middleName,
    lastName: client.lastName,
    status: client.status,
  };
};

const shapeTaskClient = (client) => {
  if (!client) return client;
  const fullName = [client.firstName, client.middleName, client.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return {
    ...client,
    clientCode: client.code,
    legalName: client.name,
    displayName:
      client.businessName || client.name || fullName || null,
  };
};

const shapeTask = (task) => {
  if (!task) return task;
  return { ...task, client: shapeTaskClient(task.client) };
};

/** Prisma sometimes omits client on create/include; load missing clients in one query. */
const hydrateTaskClients = async (tasks) => {
  const list = Array.isArray(tasks) ? tasks : [tasks];
  const missingIds = [
    ...new Set(
      list.filter((t) => !t.client && t.client_Id != null).map((t) => t.client_Id)
    ),
  ];
  if (!missingIds.length) return list;

  const clients = await prisma.client.findMany({
    where: { id: { in: missingIds } },
    select: taskInclude.client.select,
  });
  const byId = new Map(clients.map((c) => [c.id, c]));

  return list.map((t) =>
    t.client ? t : { ...t, client: byId.get(t.client_Id) ?? null }
  );
};

const shapeTasks = async (tasks) => {
  const hydrated = await hydrateTaskClients(tasks);
  return hydrated.map(shapeTask);
};

const shapeTaskResponse = async (task) => {
  const [hydrated] = await hydrateTaskClients([task]);
  return shapeTask(hydrated);
};

const assertActiveClient = async (client_Id) => {
  const id = normalizeclient_Id(client_Id);
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) {
    const err = new Error("Client not found.");
    err.statusCode = 404;
    throw err;
  }
  if (client.status !== "ACTIVE") {
    const err = new Error("Task can only be created for an active client.");
    err.statusCode = 400;
    throw err;
  }
  return client;
};

const getAssigneeForAssignment = async (assignedToId) => {
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

  if (!user) return null;

  const permissions = user.roleRef?.rolePermissions?.map((rp) => rp.permission.key) || [];
  return { id: user.id, status: user.status, teamLeaderId: user.teamLeaderId, permissions };
};

const recordStatusHistory = async (tx, { taskId, fromStatus, toStatus, changedById, remarks }) => {
  await tx.taskStatusHistory.create({
    data: {
      taskId,
      fromStatus,
      toStatus,
      changedById,
      remarks: remarks || null,
    },
  });
};

const getTaskById = async (id) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: taskInclude,
  });
  if (!task) {
    const err = new Error("Task not found.");
    err.statusCode = 404;
    throw err;
  }
  return shapeTaskResponse(task);
};

const buildListWhere = (actor) => {
  if (actor.role === "ADMIN") return {};

  if (actor.role === "TEAM_LEADER") {
    return {
      OR: [
        { assignedById: actor.id },
        { assignedToId: actor.id },
        { assignedTo: { teamLeaderId: actor.id } },
      ],
    };
  }

  return { assignedToId: actor.id };
};

const createTask = async (actor, data) => {
  if (!canCreateTask(actor)) {
    const err = new Error("You do not have permission to create tasks.");
    err.statusCode = 403;
    throw err;
  }

  const client_Id = normalizeclient_Id(data.client_Id);

  const activeClient = await assertActiveClient(client_Id);

  const serviceType = await prisma.serviceType.findUnique({
    where: {
      id: Number(data.serviceTypeId),
    },
  });

  if (!serviceType) {
    const err = new Error("Service type not found.");
    err.statusCode = 404;
    throw err;
  }

  if (!data.assignedToId) {
    const err = new Error("assignedToId is required when creating a task.");
    err.statusCode = 400;
    throw err;
  }

  const assignee = await getAssigneeForAssignment(data.assignedToId);
  assertAssignableUser(assignee);
  assertActorCanAssignTo({ actor, assignee });

  const initialStatus = TASK_STATUS.ASSIGNED;

  const task = await prisma.$transaction(async (tx) => {
    const created = await tx.task.create({
      data: {
        clientId: String(client_Id),
        client_Id,
        title: data.title,
        serviceTypeId: Number(data.serviceTypeId),
        assignedToId: data.assignedToId,
        assignedById: actor.id,
        priority: data.priority,
        status: initialStatus,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        requiresApproval: data.requiresApproval ?? true,
        remarks: data.remarks || null,
      },
      include: {
        ...taskInclude,
        serviceType: true,
      },
    });

    await recordStatusHistory(tx, {
      taskId: created.id,
      fromStatus: TASK_STATUS.DRAFT,
      toStatus: initialStatus,
      changedById: actor.id,
      remarks: "Task created and assigned",
    });

    if (data.checklistItems?.length) {
      await tx.taskChecklist.createMany({
        data: data.checklistItems.map((title) => ({
          taskId: created.id,
          title: String(title).trim(),
        })),
      });
    }

    return created;
  });

  await audit({
    actorId: actor.id,
    action: "TASK_CREATED",
    entityType: "Task",
    entityId: task.id,
    newValue: { status: task.status, assignedToId: task.assignedToId },
  });

  return shapeTaskResponse({
    ...task,
    client: task.client ?? toTaskClientSnapshot(activeClient),
  });
};

const listTasks = async (actor, { status, client_Id, assignedToId, priority, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const parsedclient_Id = client_Id != null && client_Id !== "" ? normalizeclient_Id(client_Id) : undefined;
  const where = {
    ...buildListWhere(actor),
    ...(status ? { status } : {}),
    ...(parsedclient_Id ? { client_Id: parsedclient_Id } : {}),
    ...(priority ? { priority } : {}),
    ...(assignedToId ? { assignedToId } : {}),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        ...taskInclude,
        checklist: { select: { id: true, isCompleted: true } },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return {
    tasks: await shapeTasks(tasks),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const listAssignableUsers = async (actor) => {
  const restrictToTeam =
    actor.permissions?.includes("task_assign_team") &&
    !actor.permissions?.includes("task_assign_any");

  const users = await prisma.user.findMany({
    where: {
      status: USER_STATUS.ACTIVE,
      ...(restrictToTeam ? { teamLeaderId: actor.id } : {}),
      roleRef: {
        rolePermissions: {
          some: { permission: { key: "task_receive", isActive: true } },
        },
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      teamLeaderId: true,
      roleRef: { select: { name: true } },
    },
  });

  return users.map((u) => {
    const { roleRef, ...rest } = u;
    return { ...rest, role: roleRef?.name || null };
  });
};

const updateTaskStatus = async (actor, taskId, { status, remarks, dueDate }) => {
  const task = await getTaskById(taskId);

  assertStatusTransition(task.status, status, task.requiresApproval);

  if (
    status === TASK_STATUS.COMPLETED &&
    task.requiresApproval &&
    task.status !== TASK_STATUS.APPROVED
  ) {
    const err = new Error("Task must be approved before it can be marked completed.");
    err.statusCode = 400;
    throw err;
  }
  assertCanSetStatus({
    actor,
    task,
    userId: actor.id,
    toStatus: status,
    requiresApproval: task.requiresApproval,
  });

  if (dueDate !== undefined) {
    const mayChange =
      canChangeDueDate(actor) ||
      (canRequestDueDateChange(actor) && isAssignee(task, actor.id));

    if (!mayChange) {
      const err = new Error("You do not have permission to change the due date.");
      err.statusCode = 403;
      throw err;
    }
  }

  const completedAt =
    status === TASK_STATUS.COMPLETED ? new Date() : task.completedAt;

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.task.update({
      where: { id: taskId },
      data: {
        status,
        completedAt,
        ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
        ...(remarks !== undefined ? { remarks } : {}),
      },
      include: taskInclude,
    });

    await recordStatusHistory(tx, {
      taskId,
      fromStatus: task.status,
      toStatus: status,
      changedById: actor.id,
      remarks,
    });

    return result;
  });

  await audit({
    actorId: actor.id,
    action: "TASK_STATUS_CHANGED",
    entityType: "Task",
    entityId: taskId,
    oldValue: { status: task.status },
    newValue: { status, remarks },
  });

  return shapeTaskResponse(updated);
};

const reassignTask = async (actor, taskId, { assignedToId, remarks }) => {
  if (!canReassignTask(actor)) {
    const err = new Error("You do not have permission to reassign tasks.");
    err.statusCode = 403;
    throw err;
  }

  const task = await getTaskById(taskId);

  if ([TASK_STATUS.COMPLETED, TASK_STATUS.CANCELLED].includes(task.status)) {
    const err = new Error("Cannot reassign a completed or cancelled task.");
    err.statusCode = 400;
    throw err;
  }

  const teamLeaderScope = actor.role === "TEAM_LEADER" ? actor.id : undefined;
  await assertActiveAssignee(assignedToId, { teamLeaderId: teamLeaderScope });

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.task.update({
      where: { id: taskId },
      data: {
        assignedToId,
        status: task.status === TASK_STATUS.DRAFT ? TASK_STATUS.ASSIGNED : task.status,
      },
      include: taskInclude,
    });

    await recordStatusHistory(tx, {
      taskId,
      fromStatus: task.status,
      toStatus: result.status,
      changedById: actor.id,
      remarks: remarks || `Reassigned to user ${assignedToId}`,
    });

    return result;
  });

  await audit({
    actorId: actor.id,
    action: "TASK_REASSIGNED",
    entityType: "Task",
    entityId: taskId,
    oldValue: { assignedToId: task.assignedToId },
    newValue: { assignedToId },
  });

  return shapeTaskResponse(updated);
};

const taskDetailInclude = {
  ...taskInclude,
  checklist: { orderBy: { createdAt: "asc" } },
};

const getTask = async (actor, id) => {
  const task = await prisma.task.findFirst({
    where: { id, ...buildListWhere(actor) },
    include: taskDetailInclude,
  });
  if (!task) {
    const err = new Error("Task not found.");
    err.statusCode = 404;
    throw err;
  }
  return shapeTaskResponse(task);
};

const getTaskStatusHistory = async (actor, taskId) => {
  await getTask(actor, taskId);
  return prisma.taskStatusHistory.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
    include: {
      changedBy: { select: { id: true, name: true, email: true } },
    },
  });
};

const assertCanModifyChecklist = async (actor, taskId) => {
  const task = await getTask(actor, taskId);
  if ([TASK_STATUS.COMPLETED, TASK_STATUS.CANCELLED].includes(task.status)) {
    const err = new Error("Cannot modify checklist on a completed or cancelled task.");
    err.statusCode = 400;
    throw err;
  }
  return task;
};

const addChecklistItem = async (actor, taskId, { title }) => {
  await assertCanModifyChecklist(actor, taskId);
  return prisma.taskChecklist.create({
    data: { taskId, title: title.trim() },
  });
};

const toggleChecklistItem = async (actor, taskId, checklistId) => {
  await assertCanModifyChecklist(actor, taskId);
  const item = await prisma.taskChecklist.findFirst({
    where: { id: checklistId, taskId },
  });
  if (!item) {
    const err = new Error("Checklist item not found.");
    err.statusCode = 404;
    throw err;
  }
  const isCompleted = !item.isCompleted;
  return prisma.taskChecklist.update({
    where: { id: checklistId },
    data: {
      isCompleted,
      completedById: isCompleted ? actor.id : null,
      completedAt: isCompleted ? new Date() : null,
    },
  });
};

const deleteChecklistItem = async (actor, taskId, checklistId) => {
  await assertCanModifyChecklist(actor, taskId);
  const item = await prisma.taskChecklist.findFirst({
    where: { id: checklistId, taskId },
  });
  if (!item) {
    const err = new Error("Checklist item not found.");
    err.statusCode = 404;
    throw err;
  }
  await prisma.taskChecklist.delete({ where: { id: checklistId } });
};

module.exports = {
  createTask,
  listTasks,
  listAssignableUsers,
  updateTaskStatus,
  reassignTask,
  getTaskById,
  getTask,
  getTaskStatusHistory,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
};
