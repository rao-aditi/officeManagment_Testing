const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate");
const { checkPermission } = require("../middleware/rbac");
const serviceTypesController = require("./serviceTypes.controller");
const {
  idParamValidator,
  createServiceTypeValidator,
  updateServiceTypeValidator,
} = require("./serviceTypes.validator");

router.use(authenticate);

router.post(
  "/create_ServiceType",
  checkPermission("create_service_type"),
  createServiceTypeValidator,
  serviceTypesController.createServiceType
);

router.get("/getAllserviceTypes", serviceTypesController.listServiceTypes);

router.get(
  "/get-serviceTypeById/:id",
  idParamValidator,
  serviceTypesController.getServiceTypeById
);

router.put(
  "/update_serviceType/:id",
  checkPermission("update_service_type"),
  updateServiceTypeValidator,
  serviceTypesController.updateServiceType
);

router.delete(
  "/delete_serviceType/:id",
  checkPermission("delete_service_type"),
  idParamValidator,
  serviceTypesController.deleteServiceType
);

module.exports = router;
