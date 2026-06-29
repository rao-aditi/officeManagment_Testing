const prisma = require("../../../../../shared/prisma");

const boiSelect = {
  id: true,
  code: true,
  group: true,
  entityType: true,
  prefix: true,
  name: true,
  dateOfFormation: true,
  residentialStatus: true,
  pan: true,
  tan: true,
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
  isLLP: true,
  llpId: true,
  SigningPerson: true,
  createdAt: true,
  updatedAt: true,
};

const toDate = (val) => (val ? new Date(val) : null);

const createBoi = async (data) => {
  const { SigningPerson, ...clientData } = data;

  return await prisma.client.create({
    data: {
      ...clientData,
      entityType: "BODY_OF_INDIVIDUAL",
      dateOfFormation: toDate(clientData.dateOfFormation),
      dateOfCommencementOfBusiness: toDate(clientData.dateOfCommencementOfBusiness),
      msmeRegistrationDate: toDate(clientData.msmeRegistrationDate),
      gstStartDate: toDate(clientData.gstStartDate),
      gstEndDate: toDate(clientData.gstEndDate),
      SigningPerson: SigningPerson
        ? { create: { ...SigningPerson, dob: toDate(SigningPerson.dob) } }
        : undefined,
    },
    select: boiSelect,
  });
};

const getAllBoi = async () => {
  return await prisma.client.findMany({
    where: { entityType: "BODY_OF_INDIVIDUAL" },
    select: boiSelect,
  });
};

const getBoiById = async (id) => {
  return await prisma.client.findFirst({
    where: { id: Number(id), entityType: "BODY_OF_INDIVIDUAL" },
    select: boiSelect,
  });
};

const updateBoi = async (id, data) => {
  const { SigningPerson, ...clientData } = data;

  return await prisma.client.update({
    where: { id: Number(id) },
    data: {
      ...clientData,
      dateOfFormation: toDate(clientData.dateOfFormation),
      dateOfCommencementOfBusiness: toDate(clientData.dateOfCommencementOfBusiness),
      msmeRegistrationDate: toDate(clientData.msmeRegistrationDate),
      gstStartDate: toDate(clientData.gstStartDate),
      gstEndDate: toDate(clientData.gstEndDate),
      SigningPerson: SigningPerson
        ? {
            upsert: {
              create: { ...SigningPerson, dob: toDate(SigningPerson.dob) },
              update: { ...SigningPerson, dob: toDate(SigningPerson.dob) },
            },
          }
        : undefined,
    },
    select: boiSelect,
  });
};

const deleteBoi = async (id) => {
  return await prisma.client.delete({
    where: { id: Number(id) },
  });
};

module.exports = { createBoi, getAllBoi, getBoiById, updateBoi, deleteBoi };