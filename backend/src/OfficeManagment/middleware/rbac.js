const { errorResponse } = require("../utils/response.utils");

const hasPermissionOnRequest = (req, permission) =>
  Boolean(req.user?.permissions?.includes(permission));

const hasAnyPermissionOnRequest = (req, permissions = []) =>
  permissions.some((p) => hasPermissionOnRequest(req, p));

const hasAllPermissionsOnRequest = (req, permissions = []) =>
  permissions.every((p) => hasPermissionOnRequest(req, p));

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!hasPermissionOnRequest(req, requiredPermission)) {
      return errorResponse(
        res,
        `Access denied. You do not have permission to: ${requiredPermission}`,
        403
      );
    }

    next();
  };
};

const checkAnyPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!hasAnyPermissionOnRequest(req, requiredPermissions)) {
      return errorResponse(res, "Access denied. Insufficient permissions.", 403);
    }

    next();
  };
};

const checkAllPermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!hasAllPermissionsOnRequest(req, requiredPermissions)) {
      return errorResponse(res, "Access denied. Insufficient permissions.", 403);
    }

    next();
  };
};

/** restrict by role name (prefer checkPermission for new routes). */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role || !allowedRoles.includes(role)) {
      return errorResponse(
        res,
        `Access denied. Required role: ${allowedRoles.join(", ")}.`,
        403
      );
    }

    next();
  };
};

module.exports = {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  checkRole,
};
