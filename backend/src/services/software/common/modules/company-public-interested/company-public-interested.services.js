const prisma = require(
  "../../../../../shared/prisma"
);

const companyPublicInterestedSelect =
  {
    id: true,
    code: true,
    group: true,
    entityType: true,

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
const createCompanyPublicInterested = async (data) => {
  const {
    SigningPerson,
    ...clientData
  } = data;

  const payload = {
    ...clientData,

    dateOfIncorporation:
      clientData.dateOfIncorporation
        ? new Date(clientData.dateOfIncorporation)
        : null,

    dateOfCommencementOfBusiness:
      clientData.dateOfCommencementOfBusiness
        ? new Date(clientData.dateOfCommencementOfBusiness)
        : null,

    msmeRegistrationDate:
      clientData.msmeRegistrationDate
        ? new Date(clientData.msmeRegistrationDate)
        : null,

    gstStartDate:
      clientData.gstStartDate
        ? new Date(clientData.gstStartDate)
        : null,

    gstEndDate:
      clientData.gstEndDate
        ? new Date(clientData.gstEndDate)
        : null,
  };

  const signingPersonPayload =
    SigningPerson
      ? {
          ...SigningPerson,

          dob: SigningPerson.dob
            ? new Date(SigningPerson.dob)
            : null,
        }
      : undefined;

  return await prisma.client.create({
    data: {
      ...payload, // ✅ clientData ki jagah payload

      entityType:
        "COMPANY_PUBLIC_INTERESTED",

      SigningPerson:
        signingPersonPayload
          ? {
              create:
                signingPersonPayload,
            }
          : undefined,
    },

    select:
      companyPublicInterestedSelect,
  });
};

// GET ALL
const getAllCompanyPublicInterested =
  async () => {
    return await prisma.client.findMany(
      {
        where: {
          entityType:
            "COMPANY_PUBLIC_INTERESTED",
        },

        select:
          companyPublicInterestedSelect,
      }
    );
  };

// GET BY ID
const getCompanyPublicInterestedById =
  async (id) => {
    const data =
      await prisma.client.findFirst(
        {
          where: {
            id: Number(
              id
            ),

            entityType:
              "COMPANY_PUBLIC_INTERESTED",
          },

          select:
            companyPublicInterestedSelect,
        }
      );

    if (!data) {
      throw new Error(
        "Company Public Interested not found"
      );
    }

    return data;
  };

// UPDATE
const updateCompanyPublicInterested =
  async (
    id,
    data
  ) => {
    const {
      SigningPerson,
      ...clientData
    } = data;

    return await prisma.client.update(
      {
        where: {
          id: Number(
            id
          ),
        },

        data: {
          ...clientData,

          entityType:
            "COMPANY_PUBLIC_INTERESTED",

          SigningPerson:
            SigningPerson
              ? {
                  upsert:
                    {
                      create:
                        SigningPerson,

                      update:
                        SigningPerson,
                    },
                }
              : undefined,
        },

        select:
          companyPublicInterestedSelect,
      }
    );
  };

// DELETE
const deleteCompanyPublicInterested =
  async (id) => {
    return await prisma.client.delete(
      {
        where: {
          id: Number(
            id
          ),
        },
      }
    );
  };

module.exports = {
  createCompanyPublicInterested,
  getAllCompanyPublicInterested,
  getCompanyPublicInterestedById,
  updateCompanyPublicInterested,
  deleteCompanyPublicInterested,
};