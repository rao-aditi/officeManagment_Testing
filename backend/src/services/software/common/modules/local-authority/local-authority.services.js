const prisma = require(
  "../../../../../shared/prisma"
);

const localAuthoritySelect =
  {
    id: true,
    code: true,
    group: true,
    entityType: true,

    prefix: true,
    name: true,

    // entityDate 
    dateOfIncorporation:
      true,

    residentialStatus:
      true,
    pan: true,
    tan: true,

    dateOfCommencementOfBusiness:
      true,

    isFIIFPI: true,
    sebiRegnNo: true,

    isMSME: true,
    msmeRegistrationNo:
      true,

    msmeRegistrationDate:
      true,

    enterpriseType:
      true,

    majorActivity:
      true,

    businessName:
      true,

    contactPerson:
      true,

    natureOfBusiness:
      true,

    stockValuationMethod:
      true,

    gstNo: true,
    gstStartDate:
      true,

    gstEndDate:
      true,

    vatRegNo: true,

    centralSalesTaxNo:
      true,

    serviceTaxRegNo:
      true,

    otherRegistration:
      true,

    isLLP: true,
    llpId: true,

    // ROC Section
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

    companySub: true,

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

const createLocalAuthority =
  async (data) => {
    const {
      SigningPerson,
      ...clientData
    } = data;

    return await prisma.client.create(
      {
        data: {
          ...clientData,

          entityType:
            "LOCAL_AUTHORITY",

          SigningPerson:
            SigningPerson
              ? {
                  create:
                    SigningPerson,
                }
              : undefined,
        },

        select:
          localAuthoritySelect,
      }
    );
  };

const getAllLocalAuthorities =
  async () => {
    return await prisma.client.findMany(
      {
        where: {
          entityType:
            "LOCAL_AUTHORITY",
        },

        select:
          localAuthoritySelect,
      }
    );
  };

const getLocalAuthorityById =
  async (id) => {
    const data =
      await prisma.client.findFirst(
        {
          where: {
            id: Number(
              id
            ),

            entityType:
              "LOCAL_AUTHORITY",
          },

          select:
            localAuthoritySelect,
        }
      );

    if (!data) {
      throw new Error(
        "Local Authority not found"
      );
    }

    return data;
  };

const updateLocalAuthority =
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
          localAuthoritySelect,
      }
    );
  };

const deleteLocalAuthority =
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
  createLocalAuthority,
  getAllLocalAuthorities,
  getLocalAuthorityById,
  updateLocalAuthority,
  deleteLocalAuthority,
};