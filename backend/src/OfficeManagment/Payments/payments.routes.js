const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate");
const { checkPermission } = require("../middleware/rbac");
const paymentsController = require("./payments.controller");
const {
  idParamValidator,
  invoiceIdParamValidator,
  listQueryValidator,
  createPaymentValidator,
} = require("./payments.validator");

router.use(authenticate);

router.post(
  "/create_Payment",
  checkPermission("generate_invoice"),
  createPaymentValidator,
  paymentsController.createPayment
);

router.get(
  "/getAllPayments",
  checkPermission("generate_invoice"),
  listQueryValidator,
  paymentsController.listPayments
);

router.get(
  "/get-paymentById/:id",
  checkPermission("generate_invoice"),
  idParamValidator,
  paymentsController.getPaymentById
);

router.get(
  "/invoice/:invoiceId",
  checkPermission("generate_invoice"),
  invoiceIdParamValidator,
  paymentsController.listPaymentsByInvoice
);

module.exports = router;
