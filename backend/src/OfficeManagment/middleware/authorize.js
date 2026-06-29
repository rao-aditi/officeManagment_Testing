const { errorResponse } = require("../utils/response.utils");

/**
 * Route guard — pass role names and/or permission keys.
 *
 * @example authorize("ADMIN")
 * @example authorize.anyPermission("reassign_task", "reassign_task_within_team")
 */

const authorize = (...allowedRolesOrPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, "Not authenticated.", 401);
    }

    const { role } = req.user;
    const allowedByRole = allowedRolesOrPermissions.includes(role);
    const allowedByPermission = allowedRolesOrPermissions.some((p) =>
      req.user.permissions?.includes(p)
    );

    if (!allowedByRole && !allowedByPermission) {
      return errorResponse(res, "Access denied.", 403);
    }

    next();
  };
};

authorize.permission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, "Not authenticated.", 401);
    }

    if (!permissions.some((p) => req.user.permissions?.includes(p))) {
      return errorResponse(res, "Access denied.", 403);
    }

    next();
  };
};

authorize.role = (...roles) => authorize(...roles);

module.exports = authorize;
