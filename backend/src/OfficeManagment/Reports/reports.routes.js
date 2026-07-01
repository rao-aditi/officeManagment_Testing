const express = require("express");
const authenticate = require("../middleware/authenticate");
const { checkAnyPermission } = require("../middleware/rbac");
const {
  getTaskReport,
  getOverdueReport,
  getClientReport,
  getFeeReport,
  getInvoiceReport,
  getPaymentReport,
  getStaffPerformanceReport,
} = require("./reports.controller");

const router = express.Router();

router.use(authenticate);

const anyReportAccess = checkAnyPermission(
  "view_all_reports",
  "view_operational_reports",
  "view_own_reports"
);

router.get(
  "/tasks",
  anyReportAccess,
  getTaskReport
);

router.get(
  "/overdue",
  checkAnyPermission("view_all_reports", "view_operational_reports"),
  getOverdueReport
);

router.get(
  "/clients",
  checkAnyPermission("view_all_reports"),
  getClientReport
);

router.get(
  "/fees",
  checkAnyPermission("view_all_reports"),
  getFeeReport
);

router.get(
  "/invoices",
  checkAnyPermission("view_all_reports"),
  getInvoiceReport
);

router.get(
  "/payments",
  checkAnyPermission("view_all_reports"),
  getPaymentReport
);

router.get(
  "/staff-performance",
  checkAnyPermission("view_all_reports", "view_operational_reports"),
  getStaffPerformanceReport
);

module.exports = router;
