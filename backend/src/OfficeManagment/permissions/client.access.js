const prisma = require("../../shared/prisma");

/**
 * Client IDs a user may access based on role + task relationships.
 */
const getAccessibleClientIds = async (actor) => {
  if (actor.permissions?.includes("view_all_clients")) {
    return null; 
  }

  if (actor.permissions?.includes("view_assigned_clients")) {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { assignedById: actor.id },
          { assignedTo: { teamLeaderId: actor.id } },
          { assignedToId: actor.id },
        ],
        client_Id: { not: null },
      },
      select: { client_Id: true },
      distinct: ["client_Id"],
    });
    return [...new Set(tasks.map((t) => t.client_Id).filter((id) => id !== null))];
  }

  if (actor.permissions?.includes("view_client_via_task")) {
    const tasks = await prisma.task.findMany({
      where: { assignedToId: actor.id, client_Id: { not: null } },
      select: { client_Id: true },
      distinct: ["client_Id"],
    });
    return [...new Set(tasks.map((t) => t.client_Id).filter((id) => id !== null))];
  }

  return [];
};

const buildClientScopeWhere = async (actor) => {
  const clientIds = await getAccessibleClientIds(actor);

  if (clientIds === null) return {};
  if (!clientIds.length) return { id: { in: [-1] } }; // -1 matches nothing (Int field)
  return { id: { in: clientIds.map(Number) } };
};

const assertCanAccessClient = async (actor, clientId) => {
  const clientIds = await getAccessibleClientIds(actor);

  if (clientIds === null) return true;

  if (!clientIds.includes(clientId)) {
    const err = new Error("You do not have permission to view this client.");
    err.statusCode = 403;
    throw err;
  }

  return true;
};

/** Remove fee/financial fields when actor lacks permission. Populate name, companyName, phone, address fields for frontend compatibility. */
const sanitizeClientForRole = (client, actor) => {
  if (!client) return client;

  // Extract primary address from CompanyAddress relation
  const primaryAddress = client.addresses?.find((a) => a.isPrimary) || client.addresses?.[0];
  const addressString = primaryAddress
    ? [primaryAddress.line1, primaryAddress.line2, primaryAddress.city, primaryAddress.state, primaryAddress.pincode]
        .filter(Boolean)
        .join(", ")
    : null;

  const safe = {
    ...client,
    name: client.name,
    companyName: client.businessName || client.name,
    clientCode: client.code,
    phone: client.mobile,
    address: addressString,
  };

  if (!actor?.permissions?.includes("view_client_fee_details")) {
    delete safe.openingBalanceReqd;
  }

  return safe;
};

module.exports = {
  getAccessibleClientIds,
  buildClientScopeWhere,
  assertCanAccessClient,
  sanitizeClientForRole,
};
