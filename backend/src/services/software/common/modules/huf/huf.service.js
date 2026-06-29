const prisma = require("../../../../../shared/prisma");

const hufSelect = {
  id: true,
  code: true,
  group: true,
  entityType: true,
  dateOfFormation: true,  // add karo
  prefix: true,
  name: true,
  residentialStatus: true,
  pan: true,
  tan: true,
  dateOfCommencementOfBusiness: true,
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
  SigningPerson: true,
  createdAt: true,
  updatedAt: true,
};

const createHuf = async (data) => {
  const { SigningPerson, ...clientData } = data;

  return await prisma.client.create({
    data: {
      ...clientData,
      entityType: "HUF",
      SigningPerson: SigningPerson
        ? { create: SigningPerson }
        : undefined,
    },
    select: hufSelect,
  });
};

const getAllHuf = async () => {
  return await prisma.client.findMany({
    where: { entityType: "HUF" },
    select: hufSelect,
  });
};

const getHufById = async (id) => {
  return await prisma.client.findFirst({
    where: { id: Number(id), entityType: "HUF" },
    select: hufSelect,
  });
};

const updateHuf = async (id, data) => {
  const { SigningPerson, ...clientData } = data;

  return await prisma.client.update({
    where: { id: Number(id) },
    data: {
      ...clientData,
      SigningPerson: SigningPerson
        ? { upsert: { create: SigningPerson, update: SigningPerson } }
        : undefined,
    },
    select: hufSelect,
  });
};

const deleteHuf = async (id) => {
  return await prisma.client.delete({
    where: { id: Number(id) },
  });
}

  module.exports = {
    createHuf,
    getAllHuf,
    getHufById,
    updateHuf,
    deleteHuf,
  }
