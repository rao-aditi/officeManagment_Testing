const prisma = require("../../shared/prisma");
const reportsService = require("./reports.service");
const { assertCanAccessReport, REPORT_TYPES } = require("./report.permissions");

// Helper for parsing dates
const parseDateRange = (startDate, endDate) => {
  const filter = {};
  if (startDate) filter.gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filter.lte = end;
  }
  return Object.keys(filter).length > 0 ? filter : undefined;
};

exports.getTaskReport = async (req, res, next) => {
  try {
    assertCanAccessReport(req.user, REPORT_TYPES.TASKS);
    const { startDate, endDate, clientId, taskType, status, assignedToId, priority } = req.query;

    const where = reportsService.buildTaskWhere(req.user);

    if (startDate || endDate) {
      where.createdAt = parseDateRange(startDate, endDate);
    }
    if (clientId) where.client_Id = parseInt(clientId, 10);
    if (taskType) where.taskType = taskType;
    if (status) where.status = status;
    if (assignedToId) where.assignedToId = assignedToId;
    if (priority) where.priority = priority;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        client: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        assignedBy: { select: { id: true, name: true, email: true } },
        serviceType: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

exports.getOverdueReport = async (req, res, next) => {
  try {
    assertCanAccessReport(req.user, REPORT_TYPES.OVERDUE);
    const { startDate, endDate, assignedToId, clientId, taskType } = req.query;

    const where = {
      ...reportsService.buildTaskWhere(req.user),
      status: "OVERDUE",
    };

    if (startDate || endDate) {
      where.dueDate = parseDateRange(startDate, endDate);
    } else {
      // If no date provided, get all overdue up to today
      where.dueDate = { lt: new Date() };
    }

    if (assignedToId) where.assignedToId = assignedToId;
    if (clientId) where.client_Id = parseInt(clientId, 10);
    if (taskType) where.taskType = taskType;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        client: true,
        serviceType: true,
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { dueDate: 'desc' }
    });

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

exports.getClientReport = async (req, res, next) => {
  try {
    assertCanAccessReport(req.user, REPORT_TYPES.CLIENTS);
    const { status, city, company, startDate, endDate } = req.query;

    const where = {};
    if (status) where.status = status;
    if (company) where.businessName = { contains: company, mode: 'insensitive' };
    if (startDate || endDate) {
      where.createdAt = parseDateRange(startDate, endDate);
    }
    // based on schema: businessName, name, etc.

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    next(error);
  }
};

exports.getFeeReport = async (req, res, next) => {
  try {
    assertCanAccessReport(req.user, REPORT_TYPES.FEES);
    const { status, minAmount, maxAmount } = req.query;

    const where = {};
    if (status) where.status = status;

    if (minAmount || maxAmount) {
      where.serviceCharges = {};
      if (minAmount) where.serviceCharges.gte = parseFloat(minAmount);
      if (maxAmount) where.serviceCharges.lte = parseFloat(maxAmount);
    }

    const fees = await prisma.serviceType.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.status(200).json({ success: true, data: fees });
  } catch (error) {
    next(error);
  }
};

exports.getInvoiceReport = async (req, res, next) => {
  try {
    assertCanAccessReport(req.user, REPORT_TYPES.INVOICES);
    const { status, startDate, endDate, clientId, minAmount, maxAmount } = req.query;

    const where = {};
    if (status) where.status = status;
    if (startDate || endDate) {
      where.issuedAt = parseDateRange(startDate, endDate);
    }
    if (clientId) where.clientId = parseInt(clientId, 10);

    if (minAmount || maxAmount) {
      where.total = {};
      if (minAmount) where.total.gte = parseFloat(minAmount);
      if (maxAmount) where.total.lte = parseFloat(maxAmount);
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: true,
        task: { select: { title: true } },
      },
      orderBy: { issuedAt: 'desc' }
    });

    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentReport = async (req, res, next) => {
  try {
    assertCanAccessReport(req.user, REPORT_TYPES.PAYMENTS);
    const { mode, startDate, endDate, status } = req.query;

    const where = {};
    if (mode) where.mode = mode;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.paymentDate = parseDateRange(startDate, endDate);
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        invoice: {
          include: { client: true }
        }
      },
      orderBy: { paymentDate: 'desc' }
    });

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

exports.getStaffPerformanceReport = async (req, res, next) => {
  try {
    assertCanAccessReport(req.user, REPORT_TYPES.STAFF_PERFORMANCE);

    const users = await prisma.user.findMany({
      where: reportsService.buildStaffWhere(req.user),
      select: {
        id: true,
        name: true,
        email: true,
        tasksAssigned: {
          select: {
            status: true,
            createdAt: true,
            completedAt: true,
            dueDate: true
          }
        }
      }
    });

    const report = users.map(user => {
      const tasks = user.tasksAssigned || [];
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
      const overdueTasks = tasks.filter(t => t.status === 'OVERDUE' || (t.dueDate && t.dueDate < new Date() && t.status !== 'COMPLETED'));
      const rejectedTasks = tasks.filter(t => t.status === 'REJECTED');

      let avgCompletionTimeHours = 0;
      if (completedTasks.length > 0) {
        const totalHours = completedTasks.reduce((acc, t) => {
          if (t.completedAt && t.createdAt) {
            const diffMs = new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime();
            return acc + (diffMs / (1000 * 60 * 60)); // hours
          }
          return acc;
        }, 0);
        avgCompletionTimeHours = (totalHours / completedTasks.length).toFixed(2);
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        totalTasks,
        completed: completedTasks.length,
        overdue: overdueTasks.length,
        rejected: rejectedTasks.length,
        avgCompletionTimeHours: parseFloat(avgCompletionTimeHours)
      };
    });

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};
