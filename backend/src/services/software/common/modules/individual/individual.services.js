const prisma = require("../../../../../shared/prisma");

// console.log("Prisma Models:");
// console.log(Object.keys(prisma));

const individualSelect = {
  id: true,
  code: true,
  group: true,
  entityType: true,
  prefix: true,
  name: true,
  firstName: true,
  middleName: true,
  lastName: true,
  fatherName: true,
  spouseName: true,
  qualification: true,
  nationality: true,
  occupation: true,
  uinNo: true,
  nameAsPerUIN: true,
  mobileLinkedWithUIN: true,
  passportStatus: true,
  passportNumber: true,
  gender: true,
  votersId: true,
  dob: true,
  dod: true,
  residentialStatus: true,
  pan: true,
  tan: true,
  din: true,
  dateOfCommencementOfBusiness: true,
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

  // Relation
  SigningPerson: true,

  createdAt: true,
  updatedAt: true,
};

const createIndividual = async (data) => {
  const { signingPerson, isLLP, llpId, ...clientData } = data;

  return await prisma.client.create({
    data: {
      ...clientData,
      name: `${data.firstName} ${data.lastName}`,
      entityType: "INDIVIDUAL",

      SigningPerson: signingPerson
        ? {
            create: signingPerson,
          }
        : undefined,
    },
    select: individualSelect,
  });
};

const getAllIndividuals = async () => {
  return await prisma.client.findMany({
    where: {
      entityType: "INDIVIDUAL",
    },
    select: individualSelect,
  });
};

const getIndividualById = async (id) => {
  return await prisma.client.findFirst({
    where: {
      id: Number(id),
      entityType: "INDIVIDUAL",
    },
    select: individualSelect,
  });
};

const updateIndividual = async (id, data) => {
  const { signingPerson, isLLP, llpId, ...clientData } = data;

  return await prisma.client.update({
    where: {
      id: Number(id),
    },
    data: {
      ...clientData,

      SigningPerson: signingPerson
        ? {
            upsert: {
              create: signingPerson,
              update: signingPerson,
            },
          }
        : undefined,
    },
    select: individualSelect,
  });
};

const deleteIndividual = async (id) => {
  return await prisma.client.delete({
    where: {
      id: Number(id),
    },
  });
};

module.exports = {
  createIndividual,
  getAllIndividuals,
  getIndividualById,
  updateIndividual,
  deleteIndividual,
};