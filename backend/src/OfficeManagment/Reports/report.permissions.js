const canViewAllReports = (actor) =>
  actor.permissions?.includes("view_all_reports");

const canViewOperationalReports = (actor) =>
  actor.permissions?.includes("view_operational_reports");

const canViewOwnReports = (actor) =>
  actor.permissions?.includes("view_own_reports");

const REPORT_TYPES = {
  TASKS: "tasks",
  OVERDUE: "overdue",
  CLIENTS: "clients",
  FEES: "fees",
  INVOICES: "invoices",
  PAYMENTS: "payments",
  STAFF_PERFORMANCE: "staff-performance",
};

const ADMIN_ONLY_REPORTS = [
  REPORT_TYPES.CLIENTS,
  REPORT_TYPES.FEES,
  REPORT_TYPES.INVOICES,
  REPORT_TYPES.PAYMENTS,
];

const OPERATIONAL_REPORTS = [
  REPORT_TYPES.TASKS,
  REPORT_TYPES.OVERDUE,
  REPORT_TYPES.STAFF_PERFORMANCE,
];

const assertCanAccessReport = (actor, reportType) => {
  if (canViewAllReports(actor)) return;

  if (ADMIN_ONLY_REPORTS.includes(reportType)) {
    const err = new Error("You do not have permission to access this report.");
    err.statusCode = 403;
    throw err;
  }

  if (canViewOperationalReports(actor)) {
    if (!OPERATIONAL_REPORTS.includes(reportType)) {
      const err = new Error("You do not have permission to access this report.");
      err.statusCode = 403;
      throw err;
    }
    return;
  }

  if (canViewOwnReports(actor)) {
    if (reportType !== REPORT_TYPES.TASKS) {
      const err = new Error("You do not have permission to access this report.");
      err.statusCode = 403;
      throw err;
    }
    return;
  }

  const err = new Error("You do not have permission to access reports.");
  err.statusCode = 403;
  throw err;
};

module.exports = {
  canViewAllReports,
  canViewOperationalReports,
  canViewOwnReports,
  assertCanAccessReport,
  REPORT_TYPES,
};
