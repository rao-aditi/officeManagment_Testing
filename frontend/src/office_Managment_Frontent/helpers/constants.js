export const apiEndPoints = {
  userLogin: "api/auth/login",

  // Client
  allClients: "api/client/allClients",
  clientById: (id) => `api/client/${id}`,

  // User
  allUsers: "api/user/getAllUser",
  addUser: "api/user/addUser",
  getUserById: "api/user/getUserById ",
  updateUser: (id) => `api/user/${id}`,
  activateUser: (id) => `api/user/${id}/activate`,
  deactivateUser: (id) => `api/user/${id}/deactivate`,

  // Roles & Permissions
  listRoles: "api/permissions/getAllRoles",
  userPermissions: "api/permissions",
  permissionMatrix: "api/permissions/matrix",
  permissionsList: "api/permissions/list",
  rolePermissions: "api/permissions/role-permissions",
  getEnums: "api/getEnums",

  // Service Types
  getAllserviceTypes: "api/service-type/getAllserviceTypes",
  serviceTypeById: (id) => `api/service-type/get-serviceTypeById/${id}`,
  createServiceType: "api/service-type/create_ServiceType",
  updateServiceType: (id) => `api/service-type/update_serviceType/${id}`,
  deleteServiceType: (id) => `api/service-type/delete_serviceType/${id}`,

  // Quotations
  getAllQuotations: "api/quotation/getAllQuotations",
  quotationById: (id) => `api/quotation/get-quotationById/${id}`,
  createQuotation: "api/quotation/create_Quotation",
  updateQuotation: (id) => `api/quotation/update_quotation/${id}`,
  updateQuotationStatus: (id) => `api/quotation/update_quotationStatus/${id}`,

  // Invoices
  getAllInvoices: "api/invoice/getAllInvoices",
  invoiceById: (id) => `api/invoice/get-invoiceById/${id}`,
  createInvoice: "api/invoice/create_Invoice",
  updateInvoiceStatus: (id) => `api/invoice/update_invoiceStatus/${id}`,
  eligibleQuotations: "api/invoice/eligible-quotations",
  updateInvoice: (id) => `api/invoice/update_invoice/${id}`,
  cancelInvoice: (id) => `api/invoice/cancel_invoice/${id}`,

  // Payments
  getAllPayments: "api/payment/getAllPayments",
  paymentById: (id) => `api/payment/get-paymentById/${id}`,
  createPayment: "api/payment/create_Payment",
  paymentsByInvoice: (invoiceId) => `api/payment/invoice/${invoiceId}`,

  // Tasks
  taskAssignees: "api/task/assignees",
  tasks: "api/task",
  createTask: "api/task/create_Task",
  taskById: (id) => `api/task/${id}`,
  taskStatus: (id) => `api/task/${id}/status`,
  taskReassign: (id) => `api/task/${id}/reassign`,
  taskHistory: (id) => `api/task/${id}/history`,
  taskChecklist: (id) => `api/task/${id}/checklist`,
  taskChecklistToggle: (id, checklistId) =>
    `api/task/${id}/checklist/${checklistId}/toggle`,
  taskChecklistDelete: (id, checklistId) =>
    `api/task/${id}/checklist/${checklistId}`,

  // Due dates & reminders
  dueDatesDashboard: "api/due-dates/dueDate_dashboard",
  dueDateTask: (taskId) => `api/due-dates/tasks/${taskId}`,
  dueDateTaskHistory: (taskId) => `api/due-dates/tasks/${taskId}/history`,
  taskReminders: (taskId) => `api/due-dates/tasks/${taskId}/reminders`,
  myReminders: "api/due-dates/reminders/my",
  reminderById: (reminderId) => `api/due-dates/reminders/${reminderId}`,

  // Documents
  getAllDocuments: "api/documents",
  documentById: (id) => `api/documents/${id}`,
  uploadDocument: "api/documents/upload",
  deleteDocument: (id) => `api/documents/${id}`,
  documentStats: "api/documents/stats",
  downloadDocument: (id) => `api/documents/${id}/download`,
  viewDocument: (id) => `api/documents/${id}/view`,

  // Google Drive
  googleDriveAuthUrl: "api/google-drive/auth-url",
  googleDriveStatus: "api/google-drive/status",
  googleDriveDisconnect: "api/google-drive/disconnect",

  // Document Types
  getAllDocumentTypes: "api/document-type/getAllDocumentTypes",
  documentTypeById: (id) => `api/document-type/get-documentTypeById/${id}`,
  createDocumentType: "api/document-type/create_DocumentType",
  updateDocumentType: (id) => `api/document-type/update_documentType/${id}`,
  deleteDocumentType: (id) => `api/document-type/delete_documentType/${id}`,
};
