const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authenticate = require("../middleware/authenticate");
const { checkPermission } = require("../middleware/rbac");
const usersController = require("./users.controller");
const {
  createUserValidator,
  listUsersValidator,
  idParamValidator,
  updateUserValidator,
} = require("./users.validator");

router.use(authenticate);

router.post(
  "/addUser",
  checkPermission("create_user"),
  createUserValidator,
  usersController.createUser
);

router.get(
  "/getAllUser",
  checkPermission("list_users"),
  listUsersValidator,
  usersController.listUsers
);

router.put(
  "/:id",
  checkPermission("create_user"),
  updateUserValidator,
  usersController.updateUser
);

router.post(
  "/getUserById",
  body("id")
    .notEmpty()
    .withMessage("User id is required."),
  usersController.getUserById
);

router.patch(
  "/:id/deactivate",
  checkPermission("deactivate_user"),
  idParamValidator,
  usersController.deactivateUser
);

router.patch(
  "/:id/activate",
  checkPermission("deactivate_user"),
  idParamValidator,
  usersController.activateUser
);

module.exports = router;
