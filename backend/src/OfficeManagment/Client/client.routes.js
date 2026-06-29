const express = require("express");
const router = express.Router();

const clientController = require("./client.controller");
const authenticate = require("../middleware/authenticate");
const { checkAnyPermission } = require("../middleware/rbac");

router.use(authenticate);

router.get(
  "/allClients",
  checkAnyPermission(
    "view_all_clients",
    "view_assigned_clients"
  ),
  clientController.getAllClients
);

router.get(
  "/:id",
  checkAnyPermission(
    "view_all_clients",
    "view_assigned_clients"
  ),
  clientController.getClientById
);

module.exports = router;
