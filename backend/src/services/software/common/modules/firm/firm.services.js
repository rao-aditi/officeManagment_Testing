const prisma = require("../../../../../shared/prisma");

const firmSelect = {
  id: true,
  code: true,
  group: true,
  entityType: true,
  prefix: true,
  name: true,
  dateOfDeed: true,
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

const createFirm = async (data) => {
  const { SigningPerson, ...clientData } = data;

  return await prisma.client.create({
    data: {
      ...clientData,
      entityType: "FIRM",
      dateOfDeed: clientData.dateOfDeed ? new Date(clientData.dateOfDeed) : null,
      dateOfCommencementOfBusiness: clientData.dateOfCommencementOfBusiness ? new Date(clientData.dateOfCommencementOfBusiness) : null,
      msmeRegistrationDate: clientData.msmeRegistrationDate ? new Date(clientData.msmeRegistrationDate) : null,
      gstStartDate: clientData.gstStartDate ? new Date(clientData.gstStartDate) : null,
      gstEndDate: clientData.gstEndDate ? new Date(clientData.gstEndDate) : null,
      SigningPerson: SigningPerson ? { 
        create: {
          ...SigningPerson,
          dob: SigningPerson.dob ? new Date(SigningPerson.dob) : null,
        }
      } : undefined,
    },
    select: firmSelect,
  });
};
const getAllFirm = async () => {
  return await prisma.client.findMany({
    where: { entityType: "FIRM" },
    select: firmSelect,
  });
};

const getFirmById = async (id) => {
  return await prisma.client.findFirst({
    where: { id: Number(id), entityType: "FIRM" },
    select: firmSelect,
  });
};

const updateFirm = async (id, data) => {
  const { SigningPerson, ...clientData } = data;

  return await prisma.client.update({
    where: { id: Number(id) },
    data: {
      ...clientData,
      dateOfDeed: clientData.dateOfDeed ? new Date(clientData.dateOfDeed) : null,
      dateOfCommencementOfBusiness: clientData.dateOfCommencementOfBusiness ? new Date(clientData.dateOfCommencementOfBusiness) : null,
      msmeRegistrationDate: clientData.msmeRegistrationDate ? new Date(clientData.msmeRegistrationDate) : null,
      gstStartDate: clientData.gstStartDate ? new Date(clientData.gstStartDate) : null,
      gstEndDate: clientData.gstEndDate ? new Date(clientData.gstEndDate) : null,
      SigningPerson: SigningPerson ? {
        upsert: {
          create: { ...SigningPerson, dob: SigningPerson.dob ? new Date(SigningPerson.dob) : null },
          update: { ...SigningPerson, dob: SigningPerson.dob ? new Date(SigningPerson.dob) : null },
        }
      } : undefined,
    },
    select: firmSelect,
  });
};
const deleteFirm = async (id) => {
  return await prisma.client.delete({
    where: { id: Number(id) },
  });
};

module.exports = { createFirm, getAllFirm, getFirmById, updateFirm, deleteFirm };