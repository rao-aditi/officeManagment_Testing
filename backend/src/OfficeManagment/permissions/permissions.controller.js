const { successResponse, errorResponse } = require("../utils/response.utils");
const permissionsService = require("./permissions.service");

// CURRENT USER INFO
const getPermissions = (req, res) => {
  const role = req.user.role;
  return successResponse(
    res,
    {
      role,
      permissions: req.user.permissions || [],
    },
    "Permissions fetched successfully."
  );
};

// PERMISSION MATRIX
const getPermissionMatrix = async (req, res) => {
  try {
    const result = await permissionsService.getPermissionMatrix();
    return successResponse(res, result, "Permission matrix fetched successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

// ROLES CRUD
const createRole = async (req, res) => {
  try {
    const role = await permissionsService.createRole(req.body);
    return successResponse(res, { role }, "Role created successfully.", 201);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const updateRole = async (req, res) => {
  try {
    const role = await permissionsService.updateRole(req.params.id, req.body);
    return successResponse(res, { role }, "Role updated successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const listRoles = async (req, res) => {
  try {
    const roles = await permissionsService.listRoles();
    return successResponse(res, { roles }, "Roles fetched successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const deleteRole = async (req, res) => {
  try {
    await permissionsService.deleteRole(req.params.id);
    return successResponse(res, null, "Role deleted successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

// PERMISSIONS CRUD
const createPermission = async (req, res) => {
  try {
    const permission = await permissionsService.createPermission(req.body);
    return successResponse(res, { permission }, "Permission created successfully.", 201);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const listPermissions = async (req, res) => {
  try {
    const permissions = await permissionsService.listPermissions();
    return successResponse(res, { permissions }, "Permissions fetched successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

// ROLE-PERMISSION MAPPINGS

const assignPermissionsToRole = async (req, res) => {
  try {
    const { roleId, permissionIds } = req.body;
    if (!roleId || !Array.isArray(permissionIds)) {
      return errorResponse(res, "roleId (string) and permissionIds (array of strings) are required.", 400);
    }
    const roles = await permissionsService.assignPermissionsToRole(roleId, permissionIds);
    return successResponse(res, { roles }, "Permissions assigned to role successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const removePermissionsFromRole = async (req, res) => {
  try {
    const { roleId, permissionIds } = req.body;
    if (!roleId || !Array.isArray(permissionIds)) {
      return errorResponse(res, "roleId (string) and permissionIds (array of strings) are required.", 400);
    }
    const roles = await permissionsService.removePermissionsFromRole(roleId, permissionIds);
    return successResponse(res, { roles }, "Permissions removed from role successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

module.exports = {
  getPermissions,
  getPermissionMatrix,
  createRole,
  updateRole,
  listRoles,
  deleteRole,
  createPermission,
  listPermissions,
  assignPermissionsToRole,
  removePermissionsFromRole,
};
