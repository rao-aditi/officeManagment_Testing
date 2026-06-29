const prisma = require("../../../../../shared/prisma");

const createCooperativeSociety = async (data) => {
  return await prisma.company.create({
    data: {
      clientCode: data.clientCode,
      legalName: data.legalName,
      displayName: data.displayName,

      category: "COOPERATIVE_SOCIETY",

      pan: data.pan,

      gstApplicable: !!data.gstin,
      gstin: data.gstin,

      tanApplicable: !!data.tan,
      tan: data.tan,

      mobile: data.mobile,
      email: data.email,
      contactPerson: data.contactPerson,

      approvalStatus: "DRAFT",

      cooperativeSocietyDetail: {
        create: {
          societyName: data.societyName,
          registrationNumber: data.registrationNumber,
          registrationDate: data.registrationDate
            ? new Date(data.registrationDate)
            : null,

          societyType: data.societyType,

          chairmanName: data.chairmanName,
          secretaryName: data.secretaryName,
          treasurerName: data.treasurerName,
        },
      },
    },

    include: {
      cooperativeSocietyDetail: true,
    },
  });
};

module.exports = {
  createCooperativeSociety,
};