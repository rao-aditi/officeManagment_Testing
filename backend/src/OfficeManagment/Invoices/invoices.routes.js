const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate");
const { checkPermission } = require("../middleware/rbac");
const invoicesController = require("./invoices.controller");
const {
  idParamValidator,
  listQueryValidator,
  createInvoiceValidator,
  updateStatusValidator,
} = require("./invoices.validator");

router.use(authenticate);

router.post(
  "/create_Invoice",
  checkPermission("generate_invoice"),
  createInvoiceValidator,
  invoicesController.createInvoice
);

router.get(
  "/getAllInvoices",
  checkPermission("generate_invoice"),
  listQueryValidator,
  invoicesController.listInvoices
);

router.get(
  "/get-invoiceById/:id",
  checkPermission("generate_invoice"),
  idParamValidator,
  invoicesController.getInvoiceById
);

router.patch(
  "/update_invoiceStatus/:id",
  checkPermission("generate_invoice"),
  updateStatusValidator,
  invoicesController.updateInvoiceStatus
);

router.put(
  "/update_invoice/:id",
  checkPermission("generate_invoice"),
  idParamValidator,
  invoicesController.updateInvoice
);

router.post(
  "/cancel_invoice/:id",
  checkPermission("generate_invoice"),
  idParamValidator,
  invoicesController.cancelInvoice
);

module.exports = router;
