const express = require("express");
const router = express.Router();

const authController = require("./auth.controller");
const authenticate   = require("../middleware/authenticate");
const { checkPermission } = require("../middleware/rbac");
const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("./auth.validator");

router.post("/login", loginValidator, authController.login);

router.post("/forgot-password",authController.forgotPassword);

router.post("/reset-password", resetPasswordValidator, authController.resetPassword);

router.post("/refresh", authController.refresh);

router.post("/logout", authController.logout);

router.post("/logout-all", authenticate, authController.logoutAll);

router.get("/userDetails", authenticate, authController.getProfile);

router.put(
  "/change-password",
  authenticate,
  changePasswordValidator,
  authController.changePassword
);


// check for ADMIN role
router.get(
  "/admin-test",
  authenticate,
  checkPermission("view_audit_logs"),
  (req, res) => {
    res.json({ success: true, message: `Hello Admin ${req.user.email}` });
  }
);

module.exports = router;
