const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate");
const { checkPermission, checkAnyPermission } = require("../middleware/rbac");
const quotationsController = require("./quotations.controller");
const {
  idParamValidator,
  listQueryValidator,
  createQuotationValidator,
  updateQuotationValidator,
  updateStatusValidator,
} = require("./quotations.validator");

router.use(authenticate);

router.post(
  "/create_Quotation",
  checkPermission("create_quotation"),
  createQuotationValidator,
  quotationsController.createQuotation
);

router.get(
  "/getAllQuotations",
  checkAnyPermission("create_quotation", "view_quotation"),
  listQueryValidator,
  quotationsController.listQuotations
);

router.get(
  "/get-quotationById/:id",
  checkAnyPermission("create_quotation", "view_quotation"),
  idParamValidator,
  quotationsController.getQuotationById
);

router.patch(
  "/update_quotationStatus/:id",
  checkAnyPermission("create_quotation", "view_quotation"),
  updateStatusValidator,
  quotationsController.updateQuotationStatus
);

router.put(
  "/update_quotation/:id",
  checkPermission("create_quotation"),
  updateQuotationValidator,
  quotationsController.updateQuotation
);

module.exports = router;
