/** Permission keys */
export const PERMISSION_KEYS = {
  CREATE_USER: "create_user",
  DEACTIVATE_USER: "deactivate_user",
  LIST_USERS: "list_users",
  VIEW_ALL_CLIENTS: "view_all_clients",
  VIEW_ASSIGNED_CLIENTS: "view_assigned_clients",
  VIEW_CLIENT_VIA_TASK: "view_client_via_task",
  VIEW_CLIENT_FEE_DETAILS: "view_client_fee_details",
  CREATE_TASK: "create_task",
  TASK_RECEIVE: "task_receive",
  TASK_ASSIGN_ANY: "task_assign_any",
  TASK_ASSIGN_TEAM: "task_assign_team",
  VIEW_ALL_TASKS: "view_all_tasks",
  VIEW_OWN_TASKS: "view_own_tasks",
  REASSIGN_TASK: "reassign_task",
  REASSIGN_TASK_WITHIN_TEAM: "reassign_task_within_team",
  UPDATE_TASK_STATUS: "update_task_status",
  MARK_TASK_COMPLETE: "mark_task_complete",
  APPROVE_TASK: "approve_task",
  APPROVE_TASK_IF_ENABLED: "approve_task_if_enabled",
  CHANGE_DUE_DATE: "change_due_date",
  REQUEST_DUE_DATE_CHANGE: "request_due_date_change",
  CREATE_CHANGE_FEES: "create_change_fees",
  CREATE_QUOTATION: "create_quotation",
  VIEW_QUOTATION: "view_quotation",
  GENERATE_INVOICE: "generate_invoice",
  SEND_CLIENT_MESSAGES: "send_client_messages",
  UPLOAD_DOCUMENTS: "upload_documents",
  DELETE_DOCUMENTS: "delete_documents",
  CREATE_DOCUMENT_TYPE: "create_document_type",
  UPDATE_DOCUMENT_TYPE: "update_document_type",
  DELETE_DOCUMENT_TYPE: "delete_document_type",
  VIEW_ALL_REPORTS: "view_all_reports",
  VIEW_OPERATIONAL_REPORTS: "view_operational_reports",
  VIEW_OWN_REPORTS: "view_own_reports",
  VIEW_AUDIT_LOGS: "view_audit_logs",
  CREATE_SERVICE_TYPE: "create_service_type",
  UPDATE_SERVICE_TYPE: "update_service_type",
  DELETE_SERVICE_TYPE: "delete_service_type",
};


export const MODULE_PERMISSIONS = {
  userManagement: [
    PERMISSION_KEYS.CREATE_USER,
    PERMISSION_KEYS.LIST_USERS,
    PERMISSION_KEYS.DEACTIVATE_USER,
  ],
  clientManagement: [
    PERMISSION_KEYS.VIEW_ALL_CLIENTS,
    PERMISSION_KEYS.VIEW_ASSIGNED_CLIENTS,
    PERMISSION_KEYS.VIEW_CLIENT_VIA_TASK,
  ],
  financial: [
    PERMISSION_KEYS.CREATE_CHANGE_FEES,
    PERMISSION_KEYS.CREATE_QUOTATION,
    PERMISSION_KEYS.VIEW_QUOTATION,
    PERMISSION_KEYS.GENERATE_INVOICE,
  ],
  messaging: [PERMISSION_KEYS.SEND_CLIENT_MESSAGES],
  documents: [
    PERMISSION_KEYS.UPLOAD_DOCUMENTS,
    PERMISSION_KEYS.DELETE_DOCUMENTS,
    PERMISSION_KEYS.CREATE_DOCUMENT_TYPE,
    PERMISSION_KEYS.UPDATE_DOCUMENT_TYPE,
    PERMISSION_KEYS.DELETE_DOCUMENT_TYPE,
  ],
  reports: [
    PERMISSION_KEYS.VIEW_ALL_REPORTS,
    PERMISSION_KEYS.VIEW_OPERATIONAL_REPORTS,
    PERMISSION_KEYS.VIEW_OWN_REPORTS,
  ],
  auditLogs: [PERMISSION_KEYS.VIEW_AUDIT_LOGS],
  settings: [PERMISSION_KEYS.VIEW_AUDIT_LOGS],
};

export const hasPermission = (userPermissions = [], required) => {
  if (!Array.isArray(userPermissions) || userPermissions.length === 0) {
    return false;
  }
  if (Array.isArray(required)) {
    return required.some((key) => userPermissions.includes(key));
  }
  return userPermissions.includes(required);
};

export const hasAllPermissions = (userPermissions = [], required = []) => {
  if (!Array.isArray(required) || required.length === 0) return true;
  return required.every((key) => userPermissions.includes(key));
};

export const canAccessModule = (userPermissions, module) => {
  const keys = MODULE_PERMISSIONS[module];
  if (!keys) return false;
  return hasPermission(userPermissions, keys);
};
