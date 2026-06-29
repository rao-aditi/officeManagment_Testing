const bcrypt = require("bcryptjs");
const prisma = require("../../shared/prisma");
const { USER_STATUS } = require("../utils/enums");

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

const toSafeUser = (user) => {
  if (!user) return user;
  const { password: _password, ...safe } = user;
  return safe;
};

const createUser = async (actorUserId, data) => {
  const emailExists = await prisma.user.findUnique({ where: { email: data.email } });
  if (emailExists) {
    const err = new Error("A user with this email already exists.");
    err.statusCode = 409;
    throw err;
  }

  if (data.phone) {
    const phoneExists = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (phoneExists) {
      const err = new Error("A user with this phone already exists.");
      err.statusCode = 409;
      throw err;
    }
  }

  if (data.teamLeaderId) {
    const leader = await prisma.user.findUnique({
      where: { id: data.teamLeaderId },
      include: { roleRef: true },
    });
    if (!leader || leader.roleRef?.name !== "TEAM_LEADER" || leader.status !== USER_STATUS.ACTIVE) {
      const err = new Error("teamLeaderId must reference an active team leader.");
      err.statusCode = 400;
      throw err;
    }
    if (data.role !== "TEAM_MEMBER") {
      const err = new Error("Only team members can be linked to a team leader.");
      err.statusCode = 400;
      throw err;
    }
  }

  const roleRecord = await prisma.role.findUnique({
    where: { name: data.role },
  });
  if (!roleRecord) {
    const err = new Error(`Role "${data.role}" not found in the system.`);
    err.statusCode = 400;
    throw err;
  }

  let uniqueClientIds = [];
  if (data.clientIds && data.clientIds.length > 0) {
    uniqueClientIds = Array.from(new Set(data.clientIds));
    const count = await prisma.client.count({
      where: { id: { in: uniqueClientIds } },
    });
    if (count !== uniqueClientIds.length) {
      const err = new Error("One or more provided client IDs are invalid.");
      err.statusCode = 400;
      throw err;
    }
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const created = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      password: hashedPassword,
      roleId: roleRecord.id,
      status: data.status || USER_STATUS.ACTIVE,
      createdBy: actorUserId,
      teamLeaderId: data.teamLeaderId || null,
      clientIds: uniqueClientIds,
    },
    include: { roleRef: true },
  });

  const clients = uniqueClientIds.length > 0
    ? await prisma.client.findMany({ where: { id: { in: uniqueClientIds } } })
    : [];

  const { roleRef, ...safe } = created;
  const safeUser = toSafeUser(safe);
  safeUser.role = roleRef?.name || null;
  safeUser.clients = clients;
  return safeUser;
};

const listUsers = async ({
  status = USER_STATUS.ACTIVE,
  q = "",
  page = 1,
  limit = 10,
}) => {
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        password: true,
        status: true,
        teamLeaderId: true,
        createdBy: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        clientIds: true,
        roleRef: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const allClientIds = Array.from(new Set(users.flatMap((u) => u.clientIds || [])));
  const clients = allClientIds.length > 0
    ? await prisma.client.findMany({ where: { id: { in: allClientIds } } })
    : [];
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  const mappedUsers = users.map((u) => {
    const { roleRef, ...rest } = u;
    const userClients = (u.clientIds || []).map((id) => clientMap.get(id)).filter(Boolean);
    return { ...rest, role: roleRef?.name || null, clients: userClients };
  });

  return {
    users: mappedUsers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      roleRef: true,
      teamLeader: true,
    },
  });

  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  const { password, ...safeUser } = user;

  const clients = (user.clientIds || []).length > 0
    ? await prisma.client.findMany({ where: { id: { in: user.clientIds } } })
    : [];

  return {
    ...safeUser,
    role: user.roleRef?.name || null,
    clients,
  };
};

const updateUser = async (actorUserId, userId, data) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roleRef: true },
  });

  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  if (data.email && data.email !== user.email) {
    const emailExists = await prisma.user.findUnique({ where: { email: data.email } });
    if (emailExists) {
      const err = new Error("A user with this email already exists.");
      err.statusCode = 409;
      throw err;
    }
  }

  if (data.phone !== undefined) {
    const phone = data.phone || null;
    if (phone && phone !== user.phone) {
      const phoneExists = await prisma.user.findUnique({ where: { phone } });
      if (phoneExists) {
        const err = new Error("A user with this phone already exists.");
        err.statusCode = 409;
        throw err;
      }
    }
  }

  const targetRole = data.role !== undefined ? data.role : user.roleRef?.name;

  if (
    userId === actorUserId &&
    user.roleRef?.name === "ADMIN" &&
    data.role &&
    data.role !== "ADMIN"
  ) {
    const err = new Error("You cannot change your own Admin role.");
    err.statusCode = 400;
    throw err;
  }

  const updateData = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone || null;

  if (data.role !== undefined) {
    const roleRecord = await prisma.role.findUnique({
      where: { name: data.role },
    });
    if (!roleRecord) {
      const err = new Error(`Role "${data.role}" not found in the system.`);
      err.statusCode = 400;
      throw err;
    }
    updateData.roleId = roleRecord.id;
  }

  if (targetRole !== "TEAM_MEMBER") {
    updateData.teamLeaderId = null;
  } else if (data.teamLeaderId !== undefined) {
    const teamLeaderId = data.teamLeaderId || null;
    if (teamLeaderId) {
      const leader = await prisma.user.findUnique({
        where: { id: teamLeaderId },
        include: { roleRef: true },
      });
      if (
        !leader ||
        leader.roleRef?.name !== "TEAM_LEADER" ||
        leader.status !== USER_STATUS.ACTIVE
      ) {
        const err = new Error("teamLeaderId must reference an active team leader.");
        err.statusCode = 400;
        throw err;
      }
    }
    updateData.teamLeaderId = teamLeaderId;
  }

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  if (data.clientIds !== undefined) {
    const uniqueClientIds = Array.from(new Set(data.clientIds || []));
    if (uniqueClientIds.length > 0) {
      const count = await prisma.client.count({
        where: { id: { in: uniqueClientIds } },
      });
      if (count !== uniqueClientIds.length) {
        const err = new Error("One or more provided client IDs are invalid.");
        err.statusCode = 400;
        throw err;
      }
    }
    updateData.clientIds = uniqueClientIds;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: { roleRef: true },
  });

  const clients = (updated.clientIds || []).length > 0
    ? await prisma.client.findMany({ where: { id: { in: updated.clientIds } } })
    : [];

  const { roleRef, ...safe } = updated;
  const safeUser = toSafeUser(safe);
  safeUser.role = roleRef?.name || null;
  safeUser.clients = clients;
  return safeUser;
};

const setUserStatus = async ({ actorUserId, userId, status }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roleRef: true },
  });
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  if (userId === actorUserId && user.roleRef?.name === "ADMIN" && status === USER_STATUS.INACTIVE) {
    const err = new Error("You cannot deactivate your own Admin account.");
    err.statusCode = 400;
    throw err;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status },
    include: { roleRef: true },
  });

  // Force logout everywhere when deactivated.
  if (status === USER_STATUS.INACTIVE) {
    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  const { roleRef, ...safe } = updated;
  const safeUser = toSafeUser(safe);
  safeUser.role = roleRef?.name || null;
  return safeUser;
};

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  setUserStatus,
};

