const prisma = require(
  "../../../../../shared/prisma"
);
const toDate = (val) => val ? new Date(val) : null;
const companyPrivateSelect =
  {
    id: true,
    code: true,
    group: true,
    entityType: true,

    prefix: true,
    name: true,

    dateOfIncorporation:
      true,

    residentialStatus:
      true,

    pan: true,
    tan: true,

    dateOfCommencementOfBusiness:
      true,

    isFIIFPI:
      true,

    sebiRegnNo:
      true,

    isMSME:
      true,

    msmeRegistrationNo:
      true,

    msmeRegistrationDate:
      true,

    enterpriseType:
      true,

    majorActivity:
      true,

    contactPerson:
      true,

    natureOfBusiness:
      true,

    stockValuationMethod:
      true,

    gstNo:
      true,

    gstStartDate:
      true,

    gstEndDate:
      true,

    vatRegNo:
      true,

    centralSalesTaxNo:
      true,

    serviceTaxRegNo:
      true,

    otherRegistration:
      true,

    isLLP:
      true,

    llpId:
      true,

    // ROC
    oldCompanyName:
      true,

    registrarOfCompanyId:
      true,

    RegistrarOfCompany:
      {
        select: {
          id: true,
          name: true,
        },
      },

    cin: true,
    gln: true,

    companyCategory:
      true,

    companySub:
      true,

    companyCategoryOtherSpecify:
      true,

    sec8LicenceNo:
      true,

    companyType:
      true,

    havingShareCapital:
      true,

    isPrivateOnePersonCompany:
      true,

    SigningPerson:
      true,

    createdAt:
      true,

    updatedAt:
      true,
  };

// CREATE
const createCompanyPrivate = async (data) => {
  const {
    SigningPerson,
    registrarOfCompanyId,  // ✅ extract this
    ...clientData
  } = data;

  return await prisma.client.create({
    data: {
      ...clientData,

      entityType: "COMPANY_PRIVATE",

      // ✅ Date conversions
      dateOfIncorporation: toDate(clientData.dateOfIncorporation),
      dateOfCommencementOfBusiness: toDate(clientData.dateOfCommencementOfBusiness),
      msmeRegistrationDate: toDate(clientData.msmeRegistrationDate),
      gstStartDate: toDate(clientData.gstStartDate),
      gstEndDate: toDate(clientData.gstEndDate),

      // ✅ Capital R
      RegistrarOfCompany: registrarOfCompanyId
        ? { connect: { id: registrarOfCompanyId } }
        : undefined,

      SigningPerson: SigningPerson
        ? {
            create: {
              ...SigningPerson,
              dob: toDate(SigningPerson.dob),
            },
          }
        : undefined,
    },
    select: companyPrivateSelect,
  });
};

// GET ALL
const getAllCompanyPrivate =
  async () => {
    return await prisma.client.findMany(
      {
        where: {
          entityType:
            "COMPANY_PRIVATE",
        },

        select:
          companyPrivateSelect,
      }
    );
  };

// GET BY ID
const getCompanyPrivateById =
  async (id) => {
    const data =
      await prisma.client.findFirst(
        {
          where: {
            id: Number(id),
            entityType:
              "COMPANY_PRIVATE",
          },

          select:
            companyPrivateSelect,
        }
      );

    if (!data) {
      throw new Error(
        "Company Private not found"
      );
    }

    return data;
  };

// UPDATE
const updateCompanyPrivate = async (id, data) => {
  const {
    SigningPerson,
    registrarOfCompanyId,  // ✅ extract this
    ...clientData
  } = data;

  return await prisma.client.update({
    where: { id: Number(id) },
    data: {
      ...clientData,

      entityType: "COMPANY_PRIVATE",

      // ✅ Date conversions
      dateOfIncorporation: toDate(clientData.dateOfIncorporation),
      dateOfCommencementOfBusiness: toDate(clientData.dateOfCommencementOfBusiness),
      msmeRegistrationDate: toDate(clientData.msmeRegistrationDate),
      gstStartDate: toDate(clientData.gstStartDate),
      gstEndDate: toDate(clientData.gstEndDate),

      // ✅ Capital R
      RegistrarOfCompany: registrarOfCompanyId
        ? { connect: { id: registrarOfCompanyId } }
        : undefined,

      SigningPerson: SigningPerson
        ? {
            upsert: {
              create: {
                ...SigningPerson,
                dob: toDate(SigningPerson.dob),
              },
              update: {
                ...SigningPerson,
                dob: toDate(SigningPerson.dob),
              },
            },
          }
        : undefined,
    },
    select: companyPrivateSelect,
  });
};

// DELETE
const deleteCompanyPrivate =
  async (id) => {
    return await prisma.client.delete(
      {
        where: {
          id: Number(id),
        },
      }
    );
  };

module.exports = {
  createCompanyPrivate,
  getAllCompanyPrivate,
  getCompanyPrivateById,
  updateCompanyPrivate,
  deleteCompanyPrivate,
};