const prisma = require(
  "../../../../../shared/prisma"
);

const artificialJuridicalPersonSelect =
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
const createArtificialJuridicalPerson =
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
    "ARTIFICIAL_JUDICIAL_PERSON",

  dateOfFormation:
    clientData.dateOfFormation
      ? new Date(clientData.dateOfFormation)
      : null,

  dateOfCommencementOfBusiness:
    clientData.dateOfCommencementOfBusiness
      ? new Date(
          clientData.dateOfCommencementOfBusiness
        )
      : null,

  msmeRegistrationDate:
    clientData.msmeRegistrationDate
      ? new Date(
          clientData.msmeRegistrationDate
        )
      : null,

  gstStartDate:
    clientData.gstStartDate
      ? new Date(clientData.gstStartDate)
      : null,

  gstEndDate:
    clientData.gstEndDate
      ? new Date(clientData.gstEndDate)
      : null,

  SigningPerson:
    SigningPerson
      ? {
          create: {
            ...SigningPerson,

            dob:
              SigningPerson.dob
                ? new Date(SigningPerson.dob)
                : null,
          },
        }
      : undefined,
},
        select:
          artificialJuridicalPersonSelect,
      }
    );
  };

// GET ALL
const getAllArtificialJuridicalPersons =
  async () => {
    return await prisma.client.findMany(
      {
        where: {
          entityType:
            "ARTIFICIAL_JUDICIAL_PERSON",
        },

        select:
          artificialJuridicalPersonSelect,
      }
    );
  };

// GET BY ID
const getArtificialJuridicalPersonById =
  async (id) => {
    const data =
      await prisma.client.findFirst(
        {
          where: {
            id: Number(
              id
            ),

            entityType:
              "ARTIFICIAL_JUDICIAL_PERSON",
          },

          select:
            artificialJuridicalPersonSelect,
        }
      );

    if (!data) {
      throw new Error(
        "Artificial Juridical Person not found"
      );
    }

    return data;
  };

// UPDATE
const updateArtificialJuridicalPerson =
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
            "ARTIFICIAL_JUDICIAL_PERSON",

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
          artificialJuridicalPersonSelect,
      }
    );
  };

// DELETE
const deleteArtificialJuridicalPerson =
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
  createArtificialJuridicalPerson,
  getAllArtificialJuridicalPersons,
  getArtificialJuridicalPersonById,
  updateArtificialJuridicalPerson,
  deleteArtificialJuridicalPerson,
};