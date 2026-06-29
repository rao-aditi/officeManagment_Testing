const prisma = require("../../../../../shared/prisma");

const createArtificialJuridicalPerson = async (data) => {
  return await prisma.company.create({
    data: {
      clientCode: data.clientCode,

      legalName: data.legalName,

      displayName: data.displayName,

      category: "ARTIFICIAL_JURIDICAL_PERSON",

      pan: data.pan,

      gstApplicable: !!data.gstin,
      gstin: data.gstin,

      tanApplicable: !!data.tan,
      tan: data.tan,

      mobile: data.mobile,
      email: data.email,
      contactPerson: data.contactPerson,

      approvalStatus: "DRAFT",

      artificialJuridicalDetail: {
        create: {
          entityName: data.entityName,

          legalStatus: data.legalStatus,

          registrationNumber: data.registrationNumber,

          authorizedPerson: data.authorizedPerson,

          authorizedPan: data.authorizedPan,
        },
      },
    },

    include: {
      artificialJuridicalDetail: true,
    },
  });
};

module.exports = {
  createArtificialJuridicalPerson,
};