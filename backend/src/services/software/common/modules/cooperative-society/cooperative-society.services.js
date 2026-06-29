const prisma = require(
  "../../../../../shared/prisma"
);

const cooperativeSocietySelect =
  {
    id: true,
    code: true,
    group: true,
    entityType: true,

    prefix: true,
    name: true,

    dateOfFormation:
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

    businessName:
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

    SigningPerson:
      true,

    createdAt:
      true,

    updatedAt:
      true,
  };

// CREATE
const createCooperativeSociety = async (data) => {
  const {
    SigningPerson,
    ...clientData
  } = data;

  const payload = {
    ...clientData,

    dateOfFormation: clientData.dateOfFormation
      ? new Date(clientData.dateOfFormation)
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

  const signingPersonPayload = SigningPerson
    ? {
        ...SigningPerson,
        dob: SigningPerson.dob
          ? new Date(SigningPerson.dob)
          : null,
      }
    : undefined;

  return await prisma.client.create({
    data: {
      ...payload,

      entityType: "COOPERATIVE_SOCIETY",

      SigningPerson: signingPersonPayload
        ? {
            create: signingPersonPayload,
          }
        : undefined,
    },

    select: cooperativeSocietySelect,
  });
};

// GET ALL
const getAllCooperativeSocieties =
  async () => {
    return await prisma.client.findMany(
      {
        where: {
          entityType:
            "COOPERATIVE_SOCIETY",
        },

        select:
          cooperativeSocietySelect,
      }
    );
  };

// GET BY ID
const getCooperativeSocietyById =
  async (id) => {
    const data =
      await prisma.client.findFirst(
        {
          where: {
            id: Number(
              id
            ),

            entityType:
              "COOPERATIVE_SOCIETY",
          },

          select:
            cooperativeSocietySelect,
        }
      );

    if (!data) {
      throw new Error(
        "Cooperative Society not found"
      );
    }

    return data;
  };

// UPDATE
const updateCooperativeSociety =
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
            "COOPERATIVE_SOCIETY",

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
          cooperativeSocietySelect,
      }
    );
  };

// DELETE
const deleteCooperativeSociety =
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
  createCooperativeSociety,
  getAllCooperativeSocieties,
  getCooperativeSocietyById,
  updateCooperativeSociety,
  deleteCooperativeSociety,
};