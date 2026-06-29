require("dotenv").config();
const prisma = require("../src/shared/prisma");

const ROLES = {
  ADMIN: "ADMIN",
  TEAM_LEADER: "TEAM_LEADER",
  TEAM_MEMBER: "TEAM_MEMBER",
};

const PERMISSIONS = [
  // ─── User Management
  { key: "create_user", description: "Create new user profiles" },
  { key: "deactivate_user", description: "Deactivate user profiles" },
  { key: "list_users", description: "List all user profiles in system" },

  // ─── Client Management
  { key: "view_all_clients", description: "View details of all clients" },
  { key: "view_assigned_clients", description: "View details of assigned/managed clients" },
  { key: "view_client_via_task", description: "View details of client for assigned task only" },
  { key: "view_client_fee_details", description: "View sensitive client financial/fee details" },

  // ─── Task Management
  { key: "create_task", description: "Create new client tasks" },
  { key: "task_receive", description: "User can receive tasks (assignable target)" },
  { key: "task_assign_any", description: "Assign tasks to any assignable user" },
  { key: "task_assign_team", description: "Assign tasks only within own team" },
  { key: "view_all_tasks", description: "View all tasks across the company" },
  { key: "view_own_tasks", description: "View tasks assigned to oneself" },
  { key: "reassign_task", description: "Reassign any tasks to users globally" },
  { key: "reassign_task_within_team", description: "Reassign tasks within one's own team" },
  { key: "update_task_status", description: "Generic update of task progress/status" },
  { key: "mark_task_complete", description: "Mark assigned task as completed" },
  { key: "approve_task", description: "Approve submitted tasks globally" },
  { key: "approve_task_if_enabled", description: "Approve tasks assigned within one's team if enabled" },
  { key: "change_due_date", description: "Change due dates on tasks globally" },
  { key: "request_due_date_change", description: "Request or perform limited team due date changes" },

  // ─── Financial / Billing Management
  { key: "create_change_fees", description: "Create or change billing fees" },
  { key: "create_quotation", description: "Create quotations/proposals for clients" },
  { key: "view_quotation", description: "View client quotations" },
  { key: "generate_invoice", description: "Generate client invoices" },

  // ─── Messaging & Client Interaction
  { key: "send_client_messages", description: "Send client messages directly or via templates" },

  // ─── Document Management
  { key: "upload_documents", description: "Upload client documents" },
  { key: "delete_documents", description: "Delete client documents permanently" },
  { key: "create_document_type", description: "Create new document types" },
  { key: "update_document_type", description: "Update existing document types" },
  { key: "delete_document_type", description: "Delete document types" },

  // ─── Reports & Audit Logs
  { key: "view_all_reports", description: "Access all analytics and audit reports" },
  { key: "view_operational_reports", description: "Access operational/team performance reports" },
  { key: "view_own_reports", description: "Access own task and activity reports only" },
  { key: "view_audit_logs", description: "Access security audit logs" },

  // ─── Service Types Management
  { key: "create_service_type", description: "Create new service types" },
  { key: "update_service_type", description: "Update existing service types" },
  { key: "delete_service_type", description: "Delete service types" },
];

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: PERMISSIONS.map((p) => p.key), 
  [ROLES.TEAM_LEADER]: [
    "view_assigned_clients",
    "view_client_via_task",
    "create_task",
    "task_assign_team",
    "task_receive",
    "view_own_tasks",
    "reassign_task_within_team",
    "update_task_status",
    "mark_task_complete",
    "approve_task_if_enabled",
    "request_due_date_change",
    "view_quotation",
    "send_client_messages",
    "upload_documents",
    "view_operational_reports",
  ],
  [ROLES.TEAM_MEMBER]: [
    "view_client_via_task",
    "view_own_tasks",
    "update_task_status",
    "mark_task_complete",
    "upload_documents",
    "view_own_reports",
    "task_receive",
  ],
};

async function main() {
  console.log("Seeding started...");

  // 1. Seed Roles
  const dbRoles = {};
  for (const roleName of Object.values(ROLES)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, isActive: true },
    });
    dbRoles[roleName] = role;
    console.log(`Role seeded/verified: ${role.name}`);
  }

  // 2. Seed Permissions
  const dbPermissions = {};
  for (const perm of PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: { key: perm.key },
      update: { description: perm.description },
      create: { key: perm.key, description: perm.description, isActive: true },
    });
    dbPermissions[perm.key] = permission;
    console.log(`Permission seeded/verified: ${permission.key}`);
  }

  // 3. Clear existing mappings to avoid duplicates, then recreate
  await prisma.rolePermission.deleteMany({});
  console.log("Cleared existing Role-Permission mappings.");

  // 4. Map Permissions to Roles
  for (const [roleName, permKeys] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = dbRoles[roleName].id;
    const createData = permKeys.map((key) => ({
      roleId,
      permissionId: dbPermissions[key].id,
    }));

    await prisma.rolePermission.createMany({
      data: createData,
    });
    console.log(`Mapped ${permKeys.length} permissions to role: ${roleName}`);
  }

  const defaultServiceTypes = [
    { name: "GST", serviceCharges : 5000, taxRate: 18 },
    { name: "ITR", serviceCharges : 8000, taxRate: 18 },
    { name: "TDS", serviceCharges : 3000, taxRate: 18 },
    { name: "AUDIT", serviceCharges : 15000, taxRate: 18 },
    { name: "ACCOUNTING", serviceCharges : 6000, taxRate: 18 },
    { name: "ROC_MCA", serviceCharges : 10000, taxRate: 18 },
    { name: "CONSULTANCY", serviceCharges : 4000, taxRate: 18 },
  ];

  for (const st of defaultServiceTypes) {
    await prisma.serviceType.upsert({
      where: { name: st.name },
      update: { serviceCharges : st.serviceCharges , taxRate: st.taxRate },
      create: {
        name: st.name,
        serviceCharges : st.serviceCharges ,
        taxRate: st.taxRate,
        discountAllowed: false,
        status: "ACTIVE",
      },
    });
    console.log(`Service type seeded/verified: ${st.name}`);
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
