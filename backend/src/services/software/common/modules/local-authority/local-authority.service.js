const prisma = require("../../../../../shared/prisma");

const createLocalAuthority = async (data) => {
  return await prisma.company.create({
    data: {
      clientCode: data.clientCode,
      legalName: data.legalName,
      displayName: data.displayName,

      category: "LOCAL_AUTHORITY",

      pan: data.pan,

      gstApplicable: !!data.gstin,
      gstin: data.gstin,

      tanApplicable: !!data.tan,
      tan: data.tan,

      mobile: data.mobile,
      email: data.email,
      contactPerson: data.contactPerson,

      approvalStatus: "DRAFT",

      localAuthorityDetail: {
        create: {
          authorityName: data.authorityName,

          authorityType: data.authorityType,

          governmentDeptCode: data.governmentDeptCode,

          authorizedOfficer: data.authorizedOfficer,

          officerDesignation: data.officerDesignation,

          officerContact: data.officerContact,
        },
      },
    },

    include: {
      localAuthorityDetail: true,
    },
  });
};

module.exports = {
  createLocalAuthority,
};