const prisma = require("../../../../../shared/prisma");

const cpniSelect = {
  id: true,
  code: true,
  group: true,
  entityType: true,

  prefix: true,
  name: true,

  dateOfIncorporation: true,

  residentialStatus: true,

  pan: true,
  tan: true,

  dateOfCommencementOfBusiness:
    true,

  isFIIFPI: true,
  sebiRegnNo: true,

  isMSME: true,
  msmeRegistrationNo: true,
  msmeRegistrationDate: true,
  enterpriseType: true,
  majorActivity: true,

  businessName: true,
  contactPerson: true,
  natureOfBusiness: true,
  stockValuationMethod: true,

  gstNo: true,
  gstStartDate: true,
  gstEndDate: true,

  vatRegNo: true,
  centralSalesTaxNo: true,
  serviceTaxRegNo: true,
  otherRegistration: true,

  isLLP: true,
  llpId: true,

  oldCompanyName: true,

  registrarOfCompanyId: true,

  RegistrarOfCompany: true,

  cin: true,
  gln: true,

  companyCategory: true,
  companySub: true,
  companyCategoryOtherSpecify:
    true,

  sec8LicenceNo: true,

  companyType: true,

  havingShareCapital: true,

  isPrivateOnePersonCompany:
    true,

  SigningPerson: true,

  createdAt: true,
  updatedAt: true,
};

const toDate = (val) =>
  val ? new Date(val) : null;

// ======================================================
// CREATE
// ======================================================

const createCompanyPublicNotInterested =
  async (data) => {
    const {
      SigningPerson,
      registrarOfCompanyId,
      ...clientData
    } = data;

    return await prisma.client.create({
      data: {
        ...clientData,

        entityType:
          "COMPANY_PUBLIC_NOT_INTERESTED",

        dateOfIncorporation: toDate(
          clientData.dateOfIncorporation
        ),

        dateOfCommencementOfBusiness:
          toDate(
            clientData.dateOfCommencementOfBusiness
          ),

        msmeRegistrationDate: toDate(
          clientData.msmeRegistrationDate
        ),

        gstStartDate: toDate(
          clientData.gstStartDate
        ),

        gstEndDate: toDate(
          clientData.gstEndDate
        ),

        RegistrarOfCompany:
          registrarOfCompanyId
            ? {
                connect: {
                  id: registrarOfCompanyId,
                },
              }
            : undefined,

        SigningPerson: SigningPerson
          ? {
              create: {
                ...SigningPerson,

                dob: toDate(
                  SigningPerson.dob
                ),
              },
            }
          : undefined,
      },

      select: cpniSelect,
    });
  };

// ======================================================
// GET ALL
// ======================================================

const getAllCompanyPublicNotInterested =
  async () => {
    return await prisma.client.findMany({
      where: {
        entityType:
          "COMPANY_PUBLIC_NOT_INTERESTED",
      },

      select: cpniSelect,
    });
  };

// ======================================================
// GET SINGLE
// ======================================================

const getCompanyPublicNotInterestedById =
  async (id) => {
    return await prisma.client.findFirst({
      where: {
        id: Number(id),

        entityType:
          "COMPANY_PUBLIC_NOT_INTERESTED",
      },

      select: cpniSelect,
    });
  };

// ======================================================
// UPDATE
// ======================================================

const updateCompanyPublicNotInterested =
  async (id, data) => {
    const {
      SigningPerson,
      registrarOfCompanyId,
      ...clientData
    } = data;

    return await prisma.client.update({
      where: {
        id: Number(id),
      },

      data: {
        ...clientData,

        dateOfIncorporation: toDate(
          clientData.dateOfIncorporation
        ),

        dateOfCommencementOfBusiness:
          toDate(
            clientData.dateOfCommencementOfBusiness
          ),

        msmeRegistrationDate: toDate(
          clientData.msmeRegistrationDate
        ),

        gstStartDate: toDate(
          clientData.gstStartDate
        ),

        gstEndDate: toDate(
          clientData.gstEndDate
        ),

        registrarOfCompany:
          registrarOfCompanyId
            ? {
                connect: {
                  id: registrarOfCompanyId,
                },
              }
            : undefined,

        SigningPerson: SigningPerson
          ? {
              upsert: {
                create: {
                  ...SigningPerson,

                  dob: toDate(
                    SigningPerson.dob
                  ),
                },

                update: {
                  ...SigningPerson,

                  dob: toDate(
                    SigningPerson.dob
                  ),
                },
              },
            }
          : undefined,
      },

      select: cpniSelect,
    });
  };

// ======================================================
// DELETE
// ======================================================

const deleteCompanyPublicNotInterested =
  async (id) => {
    return await prisma.client.delete({
      where: {
        id: Number(id),
      },
    });
  };

module.exports = {
  createCompanyPublicNotInterested,

  getAllCompanyPublicNotInterested,

  getCompanyPublicNotInterestedById,

  updateCompanyPublicNotInterested,

  deleteCompanyPublicNotInterested,
};

