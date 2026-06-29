const prisma = require("../../../../../shared/prisma");

const createAopBoi = async (data) => {
  const {
    clientCode, legalName, displayName, pan, gstApplicable, gstin,
    tanApplicable, tan, mobile, email, contactPerson, financialYearStart,
    financialYearEnd, openingBalanceReqd, accountTemplateId, createdById,
    addresses, moduleAccess,
    entityName, subType, formationDate, agreementDetails, members,
  } = data;

  const existingCode = await prisma.company.findUnique({ where: { clientCode } });
  if (existingCode) throw new Error(`Client code '${clientCode}' already exists.`);

  if (!["AOP", "BOI"].includes(subType)) {
    throw new Error("subType must be 'AOP' or 'BOI'.");
  }

  return await prisma.company.create({
    data: {
      clientCode, legalName, displayName,
      category: subType === "AOP" ? "AOP" : "BOI",
      pan, gstApplicable: gstApplicable ?? false, gstin,
      tanApplicable: tanApplicable ?? false, tan,
      mobile, email, contactPerson,
      financialYearStart: financialYearStart ? new Date(financialYearStart) : null,
      financialYearEnd: financialYearEnd ? new Date(financialYearEnd) : null,
      openingBalanceReqd: openingBalanceReqd ?? false,
      accountTemplateId, createdById,

      aopBoiDetail: {
        create: {
          entityName, subType,
          formationDate: formationDate ? new Date(formationDate) : null,
          agreementDetails,
          members: members?.length ? {
            create: members.map((m) => ({
              memberName: m.memberName,
              memberPan: m.memberPan,
              sharePercentage: m.sharePercentage,
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
      aopBoiDetail: { include: { members: true } },
      addresses: true, moduleAccess: true,
    },
  });
};

const getAllAopBoi = async (query) => {
  const { page = 1, limit = 10, search, approvalStatus, isActive, subType } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    category: subType === "BOI" ? "BOI" : subType === "AOP" ? "AOP" : { in: ["AOP", "BOI"] },
    ...(approvalStatus && { approvalStatus }),
    ...(isActive !== undefined && { isActive: isActive === "true" }),
    ...(search && {
      OR: [
        { legalName: { contains: search, mode: "insensitive" } },
        { clientCode: { contains: search, mode: "insensitive" } },
        { pan: { contains: search, mode: "insensitive" } },
        { aopBoiDetail: { entityName: { contains: search, mode: "insensitive" } } },
      ],
    }),
  };

  const [total, companies] = await Promise.all([
    prisma.company.count({ where }),
    prisma.company.findMany({
      where, skip, take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        aopBoiDetail: { include: { members: true } },
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

const getAopBoiById = async (id) => {
  const company = await prisma.company.findFirst({
    where: { id, category: { in: ["AOP", "BOI"] } },
    include: {
      aopBoiDetail: { include: { members: true } },
      addresses: true, moduleAccess: true,
      documents: true,
      approvalHistory: { orderBy: { actionAt: "desc" } },
    },
  });
  if (!company) throw new Error("AOP/BOI not found.");
  return company;
};

const updateAopBoi = async (id, data) => {
  const existing = await prisma.company.findFirst({
    where: { id, category: { in: ["AOP", "BOI"] } },
  });
  if (!existing) throw new Error("AOP/BOI not found.");
  if (existing.approvalStatus === "APPROVED")
    throw new Error("Approved entity cannot be edited directly.");

  const {
    legalName, displayName, pan, gstApplicable, gstin, tanApplicable, tan,
    mobile, email, contactPerson, financialYearStart, financialYearEnd,
    openingBalanceReqd, accountTemplateId, updatedById,
    entityName, formationDate, agreementDetails,
  } = data;

  return await prisma.company.update({
    where: { id },
    data: {
      legalName, displayName, pan, gstApplicable, gstin, tanApplicable, tan,
      mobile, email, contactPerson,
      financialYearStart: financialYearStart ? new Date(financialYearStart) : undefined,
      financialYearEnd: financialYearEnd ? new Date(financialYearEnd) : undefined,
      openingBalanceReqd, accountTemplateId, updatedById,
      aopBoiDetail: {
        update: {
          entityName,
          formationDate: formationDate ? new Date(formationDate) : undefined,
          agreementDetails,
        },
      },
    },
    include: {
      aopBoiDetail: { include: { members: true } },
      addresses: true, moduleAccess: true,
    },
  });
};

const deleteAopBoi = async (id) => {
  const existing = await prisma.company.findFirst({
    where: { id, category: { in: ["AOP", "BOI"] } },
  });
  if (!existing) throw new Error("AOP/BOI not found.");
  if (existing.approvalStatus === "APPROVED")
    throw new Error("Approved entity cannot be deleted.");

  await prisma.company.delete({ where: { id } });
  return { message: "AOP/BOI deleted successfully." };
};

// ── MEMBER OPERATIONS ──
const addMember = async (companyId, data) => {
  const detail = await prisma.aopBoiDetail.findUnique({ where: { companyId } });
  if (!detail) throw new Error("AOP/BOI detail not found.");

  return await prisma.aopBoiMember.create({
    data: {
      aopBoiDetailId: detail.id,
      memberName: data.memberName,
      memberPan: data.memberPan,
      sharePercentage: data.sharePercentage,
    },
  });
};

const updateMember = async (companyId, memberId, data) => {
  const detail = await prisma.aopBoiDetail.findUnique({ where: { companyId } });
  if (!detail) throw new Error("AOP/BOI detail not found.");

  const member = await prisma.aopBoiMember.findFirst({
    where: { id: memberId, aopBoiDetailId: detail.id },
  });
  if (!member) throw new Error("Member not found.");

  return await prisma.aopBoiMember.update({
    where: { id: memberId },
    data: {
      memberName: data.memberName,
      memberPan: data.memberPan,
      sharePercentage: data.sharePercentage,
    },
  });
};

const deleteMember = async (companyId, memberId) => {
  const detail = await prisma.aopBoiDetail.findUnique({ where: { companyId } });
  if (!detail) throw new Error("AOP/BOI detail not found.");

  const member = await prisma.aopBoiMember.findFirst({
    where: { id: memberId, aopBoiDetailId: detail.id },
  });
  if (!member) throw new Error("Member not found.");

  await prisma.aopBoiMember.delete({ where: { id: memberId } });
  return { message: "Member removed successfully." };
};

// ── APPROVAL FLOW ──
const submitForApproval = async (id, userId) => {
  const company = await prisma.company.findFirst({
    where: { id, category: { in: ["AOP", "BOI"] } },
  });
  if (!company) throw new Error("AOP/BOI not found.");
  if (!["DRAFT", "SENT_BACK"].includes(company.approvalStatus))
    throw new Error(`Entity in '${company.approvalStatus}' status cannot be submitted.`);

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

const approveAopBoi = async (id, userId, remarks) => {
  const company = await prisma.company.findFirst({
    where: { id, category: { in: ["AOP", "BOI"] } },
  });
  if (!company) throw new Error("AOP/BOI not found.");
  if (company.approvalStatus !== "PENDING_APPROVAL")
    throw new Error("Only 'Pending Approval' entities can be approved.");

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

const rejectAopBoi = async (id, userId, remarks) => {
  const company = await prisma.company.findFirst({
    where: { id, category: { in: ["AOP", "BOI"] } },
  });
  if (!company) throw new Error("AOP/BOI not found.");
  if (company.approvalStatus !== "PENDING_APPROVAL")
    throw new Error("Only 'Pending Approval' entities can be rejected.");

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

const sendBackAopBoi = async (id, userId, remarks) => {
  const company = await prisma.company.findFirst({
    where: { id, category: { in: ["AOP", "BOI"] } },
  });
  if (!company) throw new Error("AOP/BOI not found.");
  if (company.approvalStatus !== "PENDING_APPROVAL")
    throw new Error("Only 'Pending Approval' entities can be sent back.");

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
  createAopBoi, getAllAopBoi, getAopBoiById,
  updateAopBoi, deleteAopBoi,
  addMember, updateMember, deleteMember,
  submitForApproval, approveAopBoi, rejectAopBoi, sendBackAopBoi,
};