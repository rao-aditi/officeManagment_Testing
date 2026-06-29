const prisma = require("../../../../../shared/prisma");

const createPublicCompany = async (data) => {
  const {
    clientCode, legalName, displayName, pan, gstApplicable, gstin,
    tanApplicable, tan, mobile, email, contactPerson, financialYearStart,
    financialYearEnd, openingBalanceReqd, accountTemplateId, createdById,
    addresses, moduleAccess,
    companyName, cin, listingStatus, stockExchange, isin,
    dateOfIncorporation, authorizedCapital, paidUpCapital, kmpPersons,
  } = data;

  const existingCode = await prisma.company.findUnique({ where: { clientCode } });
  if (existingCode) throw new Error(`Client code '${clientCode}' already exists.`);

  const existingCin = await prisma.publicCompanyDetail.findUnique({ where: { cin } });
  if (existingCin) throw new Error(`CIN '${cin}' already exists.`);

  return await prisma.company.create({
    data: {
      clientCode, legalName, displayName, category: "COMPANY_PUBLIC",
      pan, gstApplicable: gstApplicable ?? false, gstin,
      tanApplicable: tanApplicable ?? false, tan, mobile, email, contactPerson,
      financialYearStart: financialYearStart ? new Date(financialYearStart) : null,
      financialYearEnd: financialYearEnd ? new Date(financialYearEnd) : null,
      openingBalanceReqd: openingBalanceReqd ?? false, accountTemplateId, createdById,

      publicCompanyDetail: {
        create: {
          companyName, cin, listingStatus, stockExchange, isin,
          dateOfIncorporation: dateOfIncorporation ? new Date(dateOfIncorporation) : null,
          authorizedCapital: authorizedCapital ?? null,
          paidUpCapital: paidUpCapital ?? null,
          kmpPersons: kmpPersons?.length ? {
            create: kmpPersons.map((k) => ({
              kmpName: k.kmpName, din: k.din, pan: k.pan, designation: k.designation,
            })),
          } : undefined,
        },
      },

      addresses: addresses?.length ? {
        create: addresses.map((a) => ({
          addressType: a.addressType, line1: a.line1, line2: a.line2,
          city: a.city, state: a.state, pincode: a.pincode,
          country: a.country ?? "India", isPrimary: a.isPrimary ?? false,
        })),
      } : undefined,

      moduleAccess: moduleAccess?.length ? {
        create: moduleAccess.map((m) => ({
          module: m.module, isEnabled: m.isEnabled ?? false,
        })),
      } : undefined,
    },
    include: {
      publicCompanyDetail: { include: { kmpPersons: true } },
      addresses: true, moduleAccess: true,
    },
  });
};

const getAllPublicCompanies = async (query) => {
  const { page = 1, limit = 10, search, approvalStatus, isActive } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    category: "COMPANY_PUBLIC",
    ...(approvalStatus && { approvalStatus }),
    ...(isActive !== undefined && { isActive: isActive === "true" }),
    ...(search && {
      OR: [
        { legalName: { contains: search, mode: "insensitive" } },
        { clientCode: { contains: search, mode: "insensitive" } },
        { pan: { contains: search, mode: "insensitive" } },
        { gstin: { contains: search, mode: "insensitive" } },
        {
          publicCompanyDetail: {
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
      where, skip, take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        publicCompanyDetail: { include: { kmpPersons: true } },
        addresses: true, moduleAccess: true,
      },
    }),
  ]);

  return {
    data: companies,
    pagination: {
      total, page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const getPublicCompanyById = async (id) => {
  const company = await prisma.company.findFirst({
    where: { id, category: "COMPANY_PUBLIC" },
    include: {
      publicCompanyDetail: { include: { kmpPersons: true } },
      addresses: true, moduleAccess: true,
      documents: true,
      approvalHistory: { orderBy: { actionAt: "desc" } },
    },
  });
  if (!company) throw new Error("Public company not found.");
  return company;
};

const updatePublicCompany = async (id, data) => {
  const existing = await prisma.company.findFirst({
    where: { id, category: "COMPANY_PUBLIC" },
  });
  if (!existing) throw new Error("Public company not found.");
  if (existing.approvalStatus === "APPROVED")
    throw new Error("Approved company cannot be edited directly.");

  const {
    legalName, displayName, pan, gstApplicable, gstin, tanApplicable, tan,
    mobile, email, contactPerson, financialYearStart, financialYearEnd,
    openingBalanceReqd, accountTemplateId, updatedById,
    companyName, cin, listingStatus, stockExchange, isin,
    dateOfIncorporation, authorizedCapital, paidUpCapital,
  } = data;

  if (cin) {
    const cinExists = await prisma.publicCompanyDetail.findFirst({
      where: { cin, NOT: { companyId: id } },
    });
    if (cinExists) throw new Error(`CIN '${cin}' already exists.`);
  }

  return await prisma.company.update({
    where: { id },
    data: {
      legalName, displayName, pan, gstApplicable, gstin, tanApplicable, tan,
      mobile, email, contactPerson,
      financialYearStart: financialYearStart ? new Date(financialYearStart) : undefined,
      financialYearEnd: financialYearEnd ? new Date(financialYearEnd) : undefined,
      openingBalanceReqd, accountTemplateId, updatedById,
      publicCompanyDetail: {
        update: {
          companyName, cin, listingStatus, stockExchange, isin,
          dateOfIncorporation: dateOfIncorporation ? new Date(dateOfIncorporation) : undefined,
          authorizedCapital: authorizedCapital ?? undefined,
          paidUpCapital: paidUpCapital ?? undefined,
        },
      },
    },
    include: {
      publicCompanyDetail: { include: { kmpPersons: true } },
      addresses: true, moduleAccess: true,
    },
  });
};

const deletePublicCompany = async (id) => {
  const existing = await prisma.company.findFirst({
    where: { id, category: "COMPANY_PUBLIC" },
  });
  if (!existing) throw new Error("Public company not found.");
  if (existing.approvalStatus === "APPROVED")
    throw new Error("Approved company cannot be deleted.");

  await prisma.company.delete({ where: { id } });
  return { message: "Public company deleted successfully." };
};

// ── KMP OPERATIONS ──
const addKmp = async (companyId, data) => {
  const detail = await prisma.publicCompanyDetail.findUnique({ where: { companyId } });
  if (!detail) throw new Error("Public company detail not found.");

  return await prisma.publicCompanyKmp.create({
    data: {
      publicCompanyId: detail.id,
      kmpName: data.kmpName, din: data.din,
      pan: data.pan, designation: data.designation,
    },
  });
};

const updateKmp = async (companyId, kmpId, data) => {
  const detail = await prisma.publicCompanyDetail.findUnique({ where: { companyId } });
  if (!detail) throw new Error("Public company detail not found.");

  const kmp = await prisma.publicCompanyKmp.findFirst({
    where: { id: kmpId, publicCompanyId: detail.id },
  });
  if (!kmp) throw new Error("KMP not found.");

  return await prisma.publicCompanyKmp.update({
    where: { id: kmpId },
    data: { kmpName: data.kmpName, din: data.din, pan: data.pan, designation: data.designation },
  });
};

const deleteKmp = async (companyId, kmpId) => {
  const detail = await prisma.publicCompanyDetail.findUnique({ where: { companyId } });
  if (!detail) throw new Error("Public company detail not found.");

  const kmp = await prisma.publicCompanyKmp.findFirst({
    where: { id: kmpId, publicCompanyId: detail.id },
  });
  if (!kmp) throw new Error("KMP not found.");

  await prisma.publicCompanyKmp.delete({ where: { id: kmpId } });
  return { message: "KMP removed successfully." };
};

// ── APPROVAL FLOW ──
const submitForApproval = async (id, userId) => {
  const company = await prisma.company.findFirst({ where: { id, category: "COMPANY_PUBLIC" } });
  if (!company) throw new Error("Public company not found.");
  if (!["DRAFT", "SENT_BACK"].includes(company.approvalStatus))
    throw new Error(`Company in '${company.approvalStatus}' status cannot be submitted.`);

  return await prisma.company.update({
    where: { id },
    data: {
      approvalStatus: "PENDING_APPROVAL",
      approvalHistory: {
        create: { action: "SUBMITTED", actionById: userId, fromStatus: company.approvalStatus, toStatus: "PENDING_APPROVAL" },
      },
    },
  });
};

const approveCompany = async (id, userId, remarks) => {
  const company = await prisma.company.findFirst({ where: { id, category: "COMPANY_PUBLIC" } });
  if (!company) throw new Error("Public company not found.");
  if (company.approvalStatus !== "PENDING_APPROVAL")
    throw new Error("Only 'Pending Approval' companies can be approved.");

  return await prisma.company.update({
    where: { id },
    data: {
      approvalStatus: "APPROVED", isActive: true,
      approvalHistory: {
        create: { action: "APPROVED", actionById: userId, remarks, fromStatus: "PENDING_APPROVAL", toStatus: "APPROVED" },
      },
    },
  });
};

const rejectCompany = async (id, userId, remarks) => {
  const company = await prisma.company.findFirst({ where: { id, category: "COMPANY_PUBLIC" } });
  if (!company) throw new Error("Public company not found.");
  if (company.approvalStatus !== "PENDING_APPROVAL")
    throw new Error("Only 'Pending Approval' companies can be rejected.");

  return await prisma.company.update({
    where: { id },
    data: {
      approvalStatus: "REJECTED",
      approvalHistory: {
        create: { action: "REJECTED", actionById: userId, remarks, fromStatus: "PENDING_APPROVAL", toStatus: "REJECTED" },
      },
    },
  });
};

const sendBackCompany = async (id, userId, remarks) => {
  const company = await prisma.company.findFirst({ where: { id, category: "COMPANY_PUBLIC" } });
  if (!company) throw new Error("Public company not found.");
  if (company.approvalStatus !== "PENDING_APPROVAL")
    throw new Error("Only 'Pending Approval' companies can be sent back.");

  return await prisma.company.update({
    where: { id },
    data: {
      approvalStatus: "SENT_BACK",
      approvalHistory: {
        create: { action: "SENT_BACK", actionById: userId, remarks, fromStatus: "PENDING_APPROVAL", toStatus: "SENT_BACK" },
      },
    },
  });
};

module.exports = {
  createPublicCompany, getAllPublicCompanies, getPublicCompanyById,
  updatePublicCompany, deletePublicCompany,
  addKmp, updateKmp, deleteKmp,
  submitForApproval, approveCompany, rejectCompany, sendBackCompany,
};