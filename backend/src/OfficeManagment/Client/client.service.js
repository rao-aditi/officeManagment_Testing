const prisma = require("../../shared/prisma");
const {
  assertCanAccessClient,
  buildClientScopeWhere,
  sanitizeClientForRole,
} = require("../permissions/client.access");

// GET ALL CLIENTS
const getAllClients = async (
  actor,
  { search = "", isActive, page = 1, limit = 10 }
) => {
  try {
    const skip = (page - 1) * limit;
    const scopeWhere = await buildClientScopeWhere(actor);

    const where = {
      ...scopeWhere,

      ...(isActive !== undefined && {
        status: isActive ? "ACTIVE" : "INACTIVE",
      }),

      ...(search && {
        OR: [
          { code: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { businessName: { contains: search, mode: "insensitive" } },
          { contactPerson: { contains: search, mode: "insensitive" } },
          { pan: { contains: search, mode: "insensitive" } },
          { gstNo: { contains: search, mode: "insensitive" } },
          {
            mobileLinkedWithUIN: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),
    };

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        include: {
          RegistrarOfCompany: true,
          SigningPerson: true,
        },
      }),

      prisma.client.count({
        where,
      }),
    ]);

    return {
      clients: clients.map((client) =>
        sanitizeClientForRole(client, actor)
      ),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Get Clients Error:", error);

    throw {
      statusCode: 500,
      message: error.message || "Failed to fetch clients",
    };
  }
};


const getClientById = async (actor, clientId) => {
  try {
    const client = await prisma.client.findUnique({
      where: {
        id: Number(clientId),
      },
      include: {
        RegistrarOfCompany: true,
        SigningPerson: true,
      },
    });

    if (!client) {
      throw {
        statusCode: 404,
        message: "Client not found",
      };
    }

    return sanitizeClientForRole(client, actor);
  } catch (error) {
    throw {
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch client",
    };
  }
};

module.exports = {
  getAllClients,
  getClientById,
};
