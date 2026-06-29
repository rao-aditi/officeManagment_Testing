const express = require('express');
const {
  getTaskReport,
  getOverdueReport,
  getClientReport,
  getFeeReport,
  getInvoiceReport,
  getPaymentReport,
  getStaffPerformanceReport,
} = require('./reports.controller');

const router = express.Router();

// You can add your JWT authentication and role checking middleware here
// e.g., router.use(verifyToken);
// e.g., router.use(authorizeRole(['Admin', 'Team Leader']));

router.get('/tasks', getTaskReport);
router.get('/overdue', getOverdueReport);
router.get('/clients', getClientReport);
router.get('/fees', getFeeReport);
router.get('/invoices', getInvoiceReport);
router.get('/payments', getPaymentReport);
router.get('/staff-performance', getStaffPerformanceReport);

module.exports = router;
