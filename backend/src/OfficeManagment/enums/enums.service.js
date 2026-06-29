const appEnums = require("../utils/enums");
const { TaskType, TaskPriority } = require("@prisma/client");
const prisma = require("../../shared/prisma");

const toList = (enumObject) => Object.values(enumObject);

const allEnums = {
  roles: toList(appEnums.ROLES),
  status: toList(appEnums.STATUS),
  userStatus: toList(appEnums.USER_STATUS),
  clientStatus: toList(appEnums.CLIENT_STATUS),

  taskStatus: toList(appEnums.TASK_STATUS),
  taskPriority: toList(TaskPriority),
  priority: toList(appEnums.PRIORITY),

  quotationStatus: toList(appEnums.QUOTATION_STATUS),
  invoiceStatus: toList(appEnums.INVOICE_STATUS),

  paymentMode: toList(appEnums.PAYMENT_MODE),
  paymentStatus: toList(appEnums.PAYMENT_STATUS),

  documentStatus: toList(appEnums.DOCUMENT_STATUS),
  frequencyType: toList(appEnums.FREQUENCY_TYPE),
  
  reminderStatus: toList(appEnums.REMINDER_STATUS),
};

const getEnumsByPayload = async (payload = {}) => {
  const roles = await prisma.role.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { name: true },
  });

  const source = {
    ...allEnums,
    userRole: roles.map((r) => r.name),
  };

  const response = {};

  Object.keys(payload).forEach((key) => {
    if (payload[key] === true && source[key]) {
      response[key] = source[key];
    }
  });

  return response;
};

module.exports = { getEnumsByPayload };





