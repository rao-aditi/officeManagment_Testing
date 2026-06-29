const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate");
const { checkPermission } = require("../middleware/rbac");
const permissionsController = require("./permissions.controller");

// All permissions endpoints require authenticated tokens
router.use(authenticate);

// CURRENT USER INFO
router.get("/", permissionsController.getPermissions);

// PERMISSION MATRIX
router.get(
  "/matrix",
  checkPermission("view_audit_logs"),
  permissionsController.getPermissionMatrix
);

// ROLES CRUD (Admin only)
router.post(
  "/add_role",
  checkPermission("create_user"),
  permissionsController.createRole
);

router.get(
  "/getAllRoles",
  checkPermission("create_user"),
  permissionsController.listRoles
);

router.put(
  "/roles/:id",
  checkPermission("create_user"),
  permissionsController.updateRole
);

router.delete(
  "/roles/:id",
  checkPermission("create_user"),
  permissionsController.deleteRole
);

// ─────────────────────────────────────────────
// PERMISSIONS CRUD (Admin/Super Admin only)
// ─────────────────────────────────────────────
router.post(
  "/",
  checkPermission("create_user"),
  permissionsController.createPermission
);

router.get(
  "/list",
  checkPermission("create_user"),
  permissionsController.listPermissions
);

// ─────────────────────────────────────────────
// ROLE-PERMISSION MAPPINGS (Admin/Super Admin only)
// ─────────────────────────────────────────────
router.post(
  "/role-permissions",
  checkPermission("create_user"),
  permissionsController.assignPermissionsToRole
);

router.delete(
  "/role-permissions",
  checkPermission("create_user"),
  permissionsController.removePermissionsFromRole
);

module.exports = router;
