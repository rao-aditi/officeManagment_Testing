const prisma = require("../../shared/prisma");

const createRole = async (data) => {
  const existing = await prisma.role.findUnique({
    where: { name: data.name },
  });
  if (existing) {
    const err = new Error(`Role with name "${data.name}" already exists.`);
    err.statusCode = 409;
    throw err;
  }

  return prisma.role.create({
    data: {
      name: data.name,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
};

const updateRole = async (id, data) => {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) {
    const err = new Error("Role not found.");
    err.statusCode = 404;
    throw err;
  }

  if (data.name && data.name !== role.name) {
    const existing = await prisma.role.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      const err = new Error(`Role with name "${data.name}" already exists.`);
      err.statusCode = 409;
      throw err;
    }
  }

  return prisma.role.update({
    where: { id },
    data: {
      name: data.name,
      isActive: data.isActive !== undefined ? data.isActive : role.isActive,
    },
  });
};

const listRoles = async () => {
  return prisma.role.findMany({
    orderBy: { name: "asc" },
    include: {
      rolePermissions: {
        select: {
          permission: {
            select: {
              id: true,
              key: true,
              description: true,
            },
          },
        },
      },
    },
  });
};

const deleteRole = async (id) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: { users: true },
  });

  if (!role) {
    const err = new Error("Role not found.");
    err.statusCode = 404;
    throw err;
  }

  if (role.users.length > 0) {
    const err = new Error(`Cannot delete role "${role.name}" because it is currently assigned to ${role.users.length} user(s).`);
    err.statusCode = 400;
    throw err;
  }

  return prisma.role.delete({ where: { id } });
};

// ─────────────────────────────────────────────
// PERMISSION MANAGEMENT
// ─────────────────────────────────────────────

const createPermission = async (data) => {
  const existing = await prisma.permission.findUnique({
    where: { key: data.key },
  });
  if (existing) {
    const err = new Error(`Permission with key "${data.key}" already exists.`);
    err.statusCode = 409;
    throw err;
  }

  return prisma.permission.create({
    data: {
      key: data.key,
      description: data.description || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
};

const listPermissions = async () => {
  return prisma.permission.findMany({
    orderBy: { key: "asc" },
  });
};

// ─────────────────────────────────────────────
// ROLE-PERMISSION MAPPINGS
// ─────────────────────────────────────────────

const assignPermissionsToRole = async (roleId, permissionIds = []) => {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    const err = new Error("Role not found.");
    err.statusCode = 404;
    throw err;
  }

  // Verify all permissions exist
  const validPermissions = await prisma.permission.findMany({
    where: { id: { in: permissionIds } },
  });

  if (validPermissions.length !== permissionIds.length) {
    const err = new Error("One or more permission IDs are invalid.");
    err.statusCode = 400;
    throw err;
  }

  // Create mappings
  const mappingData = permissionIds.map((pId) => ({
    roleId,
    permissionId: pId,
  }));

  // Clean old associations if any, or create missing using transaction
  await prisma.$transaction(async (tx) => {
    // Delete existing mappings within the list to avoid unique constraint errors
    await tx.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: { in: permissionIds },
      },
    });

    await tx.rolePermission.createMany({
      data: mappingData,
    });
  });

  return listRoles(); // Return updated list of roles with mappings
};

const removePermissionsFromRole = async (roleId, permissionIds = []) => {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    const err = new Error("Role not found.");
    err.statusCode = 404;
    throw err;
  }

  await prisma.rolePermission.deleteMany({
    where: {
      roleId,
      permissionId: { in: permissionIds },
    },
  });

  return listRoles();
};

const getPermissionMatrix = async () => {
  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({
      include: {
        rolePermissions: {
          select: {
            permissionId: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.permission.findMany({
      orderBy: { key: "asc" },
    }),
  ]);

  return {
    roles: roles.map((r) => ({
      id: r.id,
      name: r.name,
      isActive: r.isActive,
      mappedPermissionIds: r.rolePermissions.map((rp) => rp.permissionId),
    })),
    permissions: permissions.map((p) => ({
      id: p.id,
      key: p.key,
      description: p.description,
      isActive: p.isActive,
    })),
  };
};

module.exports = {
  createRole,
  updateRole,
  listRoles,
  deleteRole,
  createPermission,
  listPermissions,
  assignPermissionsToRole,
  removePermissionsFromRole,
  getPermissionMatrix,
};
