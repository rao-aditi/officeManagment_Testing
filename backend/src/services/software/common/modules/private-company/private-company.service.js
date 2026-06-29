const prisma = require("../../../../../shared/prisma");

// ─────────────────────────────────────────────
// CREATE PRIVATE COMPANY
// ─────────────────────────────────────────────
const createPrivateCompany = async (data) => {
  const {
    // Common Company Fields
    clientCode,
    legalName,
    displayName,
    pan,
    gstApplicable,
    gstin,
    tanApplicable,
    tan,
    mobile,
    email,
    contactPerson,
    financialYearStart,
    financialYearEnd,
    openingBalanceReqd,
    accountTemplateId,
    createdById,
    addresses,
    moduleAccess,

    // Private Company Specific Fields
    companyName,
    cin,
    dateOfIncorporation,
    roc,
    registeredState,
    authorizedCapital,
    paidUpCapital,
    directors,
  } = data;

  // Check duplicate clientCode
  const existingCode = await prisma.company.findUnique({
    where: { clientCode },
  });
  if (existingCode) {
    throw new Error(`Client code '${clientCode}' already exists.`);
  }

  // Check duplicate CIN
  const existingCin = await prisma.privateCompanyDetail.findUnique({
    where: { cin },
  });
  if (existingCin) {
    throw new Error(`CIN '${cin}' already exists.`);
  }

  const company = await prisma.company.create({
    data: {
      clientCode,
      legalName,
      displayName,
      category: "COMPANY_PRIVATE",
      pan,
      gstApplicable: gstApplicable ?? false,
      gstin,
      tanApplicable: tanApplicable ?? false,
      tan,
      mobile,
      email,
      contactPerson,
      financialYearStart: financialYearStart ? new Date(financialYearStart) : null,
      financialYearEnd: financialYearEnd ? new Date(financialYearEnd) : null,
      openingBalanceReqd: openingBalanceReqd ?? false,
      accountTemplateId,
      createdById,

      privateCompanyDetail: {
        create: {
          companyName,
          cin,
          dateOfIncorporation: dateOfIncorporation ? new Date(dateOfIncorporation) : null,
          roc,
          registeredState,
          authorizedCapital: authorizedCapital ?? null,
          paidUpCapital: paidUpCapital ?? null,
          directors: directors?.length
            ? {
                create: directors.map((d) => ({
                  directorName: d.directorName,
                  din: d.din,
                  pan: d.pan,
                  designation: d.designation,
                })),
              }
            : undefined,
        },
      },

      addresses: addresses?.length
        ? {
            create: addresses.map((a) => ({
              addressType: a.addressType,
              line1: a.line1,
              line2: a.line2,
              city: a.city,
              state: a.state,
              pincode: a.pincode,
              country: a.country ?? "India",
              isPrimary: a.isPrimary ?? false,
            })),
          }
        : undefined,

      moduleAccess: moduleAccess?.length
        ? {
            create: moduleAccess.map((m) => ({
              module: m.module,
              isEnabled: m.isEnabled ?? false,
            })),
          }
        : undefined,
    },
    include: {
      privateCompanyDetail: { include: { directors: true } },
      addresses: true,
      moduleAccess: true,
    },
  });

  return company;
};

// ─────────────────────────────────────────────
// GET ALL PRIVATE COMPANIES
// ─────────────────────────────────────────────
const getAllPrivateCompanies = async (query) => {
  const {
    page = 1,
    limit = 10,
    search,
    approvalStatus,
    isActive,
  } = query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    category: "COMPANY_PRIVATE",
    ...(approvalStatus && { approvalStatus }),
    ...(isActive !== undefined && { isActive: isActive === "true" }),
    ...(search && {
      OR: [
        { legalName: { contains: search, mode: "insensitive" } },
        { clientCode: { contains: search, mode: "insensitive" } },
        { pan: { contains: search, mode: "insensitive" } },
        { gstin: { contains: search, mode: "insensitive" } },
        {
          privateCompanyDetail: {
            OR: [
              { cin: { contains: search, mode: "insensitive" } },
              { companyName: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ],
    }),
  };

  const [total, companies] = await Promise.all([
    prisma.company.count({ where }),
    prisma.company.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        privateCompanyDetail: {
          include: { directors: true },
        },
        addresses: true,
        moduleAccess: true,
      },
    }),
  ]);

  return {
    data: companies,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

// ─────────────────────────────────────────────
// GET PRIVATE COMPANY BY ID
// ─────────────────────────────────────────────
const getPrivateCompanyById = async (id) => {
  const company = await prisma.company.findFirst({
    where: { id, category: "COMPANY_PRIVATE" },
    include: {
      privateCompanyDetail: { include: { directors: true } },
      addresses: true,
      moduleAccess: true,
      documents: true,
      approvalHistory: { orderBy: { actionAt: "desc" } },
    },
  });

  if (!company) {
    throw new Error("Private company not found.");
  }

  return company;
};

// ─────────────────────────────────────────────
// UPDATE PRIVATE COMPANY
// ─────────────────────────────────────────────
const updatePrivateCompany = async (id, data) => {
  const existing = await prisma.company.findFirst({
    where: { id, category: "COMPANY_PRIVATE" },
  });

  if (!existing) {
    throw new Error("Private company not found.");
  }

  if (existing.approvalStatus === "APPROVED") {
    throw new Error("Approved company cannot be edited directly. Please send back for correction first.");
  }

  const {
    legalName,
    displayName,
    pan,
    gstApplicable,
    gstin,
    tanApplicable,
    tan,
    mobile,
    email,
    contactPerson,
    financialYearStart,
    financialYearEnd,
    openingBalanceReqd,
    accountTemplateId,
    updatedById,
    companyName,
    cin,
    dateOfIncorporation,
    roc,
    registeredState,
    authorizedCapital,
    paidUpCapital,
  } = data;

  // Check CIN duplicate (exclude current)
  if (cin) {
    const cinExists = await prisma.privateCompanyDetail.findFirst({
      where: { cin, NOT: { companyId: id } },
    });
    if (cinExists) {
      throw new Error(`CIN '${cin}' already exists.`);
    }
  }

  const updated = await prisma.company.update({
    where: { id },
    data: {
      legalName,
      displayName,
      pan,
      gstApplicable,
      gstin,
      tanApplicable,
      tan,
      mobile,
      email,
      contactPerson,
      financialYearStart: financialYearStart ? new Date(financialYearStart) : undefined,
      financialYearEnd: financialYearEnd ? new Date(financialYearEnd) : undefined,
      openingBalanceReqd,
      accountTemplateId,
      updatedById,

      privateCompanyDetail: {
        update: {
          companyName,
          cin,
          dateOfIncorporation: dateOfIncorporation ? new Date(dateOfIncorporation) : undefined,
          roc,
          registeredState,
          authorizedCapital: authorizedCapital ?? undefined,
          paidUpCapital: paidUpCapital ?? undefined,
        },
      },
    },
    include: {
      privateCompanyDetail: { include: { directors: true } },
      addresses: true,
      moduleAccess: true,
    },
  });

  return updated;
};

// ─────────────────────────────────────────────
// DELETE PRIVATE COMPANY
// ─────────────────────────────────────────────
const deletePrivateCompany = async (id) => {
  const existing = await prisma.company.findFirst({
    where: { id, category: "COMPANY_PRIVATE" },
  });

  if (!existing) {
    throw new Error("Private company not found.");
  }

  if (existing.approvalStatus === "APPROVED") {
    throw new Error("Approved company cannot be deleted.");
  }

  await prisma.company.delete({ where: { id } });

  return { message: "Private company deleted successfully." };
};

// ─────────────────────────────────────────────
// DIRECTOR OPERATIONS
// ─────────────────────────────────────────────
const addDirector = async (companyId, data) => {
  const detail = await prisma.privateCompanyDetail.findUnique({
    where: { companyId },
  });

  if (!detail) {
    throw new Error("Private company detail not found.");
  }

  const director = await prisma.companyDirector.create({
    data: {
      privateCompanyId: detail.id,
      directorName: data.directorName,
      din: data.din,
      pan: data.pan,
      designation: data.designation,
    },
  });

  return director;
};

const updateDirector = async (companyId, directorId, data) => {
  const detail = await prisma.privateCompanyDetail.findUnique({
    where: { companyId },
  });

  if (!detail) throw new Error("Private company detail not found.");

  const director = await prisma.companyDirector.findFirst({
    where: { id: directorId, privateCompanyId: detail.id },
  });

  if (!director) throw new Error("Director not found.");

  return await prisma.companyDirector.update({
    where: { id: directorId },
    data: {
      directorName: data.directorName,
      din: data.din,
      pan: data.pan,
      designation: data.designation,
    },
  });
};

const deleteDirector = async (companyId, directorId) => {
  const detail = await prisma.privateCompanyDetail.findUnique({
    where: { companyId },
  });

  if (!detail) throw new Error("Private company detail not found.");

  const director = await prisma.companyDirector.findFirst({
    where: { id: directorId, privateCompanyId: detail.id },
  });

  if (!director) throw new Error("Director not found.");

  await prisma.companyDirector.delete({ where: { id: directorId } });

  return { message: "Director removed successfully." };
};

// ─────────────────────────────────────────────
// APPROVAL FLOW
// ─────────────────────────────────────────────
const submitForApproval = async (id, userId) => {
  const company = await prisma.company.findFirst({
    where: { id, category: "COMPANY_PRIVATE" },
  });

  if (!company) throw new Error("Private company not found.");

  if (!["DRAFT", "SENT_BACK"].includes(company.approvalStatus)) {
    throw new Error(`Company in '${company.approvalStatus}' status cannot be submitted.`);
  }

  return await prisma.company.update({
    where: { id },
    data: {
      approvalStatus: "PENDING_APPROVAL",
      approvalHistory: {
        create: {
          action: "SUBMITTED",
          actionById: userId,
          fromStatus: company.approvalStatus,
          toStatus: "PENDING_APPROVAL",
        },
      },
    },
  });
};

const approveCompany = async (id, userId, remarks) => {
  const company = await prisma.company.findFirst({
    where: { id, category: "COMPANY_PRIVATE" },
  });

  if (!company) throw new Error("Private company not found.");

  if (company.approvalStatus !== "PENDING_APPROVAL") {
    throw new Error("Only 'Pending Approval' companies can be approved.");
  }

  return await prisma.company.update({
    where: { id },
    data: {
      approvalStatus: "APPROVED",
      isActive: true,
      approvalHistory: {
        create: {
          action: "APPROVED",
          actionById: userId,
          remarks,
          fromStatus: "PENDING_APPROVAL",
          toStatus: "APPROVED",
        },
      },
    },
  });
};

const rejectCompany = async (id, userId, remarks) => {
  const company = await prisma.company.findFirst({
    where: { id, category: "COMPANY_PRIVATE" },
  });

  if (!company) throw new Error("Private company not found.");

  if (company.approvalStatus !== "PENDING_APPROVAL") {
    throw new Error("Only 'Pending Approval' companies can be rejected.");
  }

  return await prisma.company.update({
    where: { id },
    data: {
      approvalStatus: "REJECTED",
      approvalHistory: {
        create: {
          action: "REJECTED",
          actionById: userId,
          remarks,
          fromStatus: "PENDING_APPROVAL",
          toStatus: "REJECTED",
        },
      },
    },
  });
};

const sendBackCompany = async (id, userId, remarks) => {
  const company = await prisma.company.findFirst({
    where: { id, category: "COMPANY_PRIVATE" },
  });

  if (!company) throw new Error("Private company not found.");

  if (company.approvalStatus !== "PENDING_APPROVAL") {
    throw new Error("Only 'Pending Approval' companies can be sent back.");
  }

  return await prisma.company.update({
    where: { id },
    data: {
      approvalStatus: "SENT_BACK",
      approvalHistory: {
        create: {
          action: "SENT_BACK",
          actionById: userId,
          remarks,
          fromStatus: "PENDING_APPROVAL",
          toStatus: "SENT_BACK",
        },
      },
    },
  });
};

module.exports = {
  createPrivateCompany,
  getAllPrivateCompanies,
  getPrivateCompanyById,
  updatePrivateCompany,
  deletePrivateCompany,
  addDirector,
  updateDirector,
  deleteDirector,
  submitForApproval,
  approveCompany,
  rejectCompany,
  sendBackCompany,
};