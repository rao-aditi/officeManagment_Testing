const prisma = require("../../../../../shared/prisma");

const aopSelect = {
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

const createAop = async (data) => {

  const { SigningPerson, ...clientData } = data;

  // CONVERT DATES
  const formattedData = {
    ...clientData,

    dateOfFormation: clientData.dateOfFormation
      ? new Date(clientData.dateOfFormation)
      : null,

    dateOfCommencementOfBusiness:
      clientData.dateOfCommencementOfBusiness
        ? new Date(clientData.dateOfCommencementOfBusiness)
        : null,

    msmeRegistrationDate: clientData.msmeRegistrationDate
      ? new Date(clientData.msmeRegistrationDate)
      : null,

    gstStartDate: clientData.gstStartDate
      ? new Date(clientData.gstStartDate)
      : null,

    gstEndDate: clientData.gstEndDate
      ? new Date(clientData.gstEndDate)
      : null,
  };

  return await prisma.client.create({
    data: {
      ...formattedData,

      entityType: "AOP",

      SigningPerson: SigningPerson
        ? {
            create: {
              ...SigningPerson,

              dob: SigningPerson.dob
                ? new Date(SigningPerson.dob)
                : null,
            },
          }
        : undefined,
    },

    select: aopSelect,
  });
};

const getAllAop = async () => {
  return await prisma.client.findMany({
    where: { entityType: "AOP" },
    select: aopSelect,
  });
};

const getAopById = async (id) => {
  return await prisma.client.findFirst({
    where: { id: Number(id), entityType: "AOP" },
    select: aopSelect,
  });
};

const updateAop = async (id, data) => {
  const { SigningPerson, ...clientData } = data;

  // CONVERT DATES FOR UPDATE
  const formattedData = {
    ...clientData,

    dateOfFormation: clientData.dateOfFormation
      ? new Date(clientData.dateOfFormation)
      : clientData.dateOfFormation === null ? null : undefined,

    dateOfCommencementOfBusiness: clientData.dateOfCommencementOfBusiness
      ? new Date(clientData.dateOfCommencementOfBusiness)
      : clientData.dateOfCommencementOfBusiness === null ? null : undefined,

    msmeRegistrationDate: clientData.msmeRegistrationDate
      ? new Date(clientData.msmeRegistrationDate)
      : clientData.msmeRegistrationDate === null ? null : undefined,

    gstStartDate: clientData.gstStartDate
      ? new Date(clientData.gstStartDate)
      : clientData.gstStartDate === null ? null : undefined,

    gstEndDate: clientData.gstEndDate
      ? new Date(clientData.gstEndDate)
      : clientData.gstEndDate === null ? null : undefined,
  };

  // Remove undefined values (fields that weren't sent)
  Object.keys(formattedData).forEach(key => {
    if (formattedData[key] === undefined) {
      delete formattedData[key];
    }
  });

  // Format signing person dob
  let formattedSigningPerson = SigningPerson;
  if (SigningPerson && SigningPerson.dob) {
    formattedSigningPerson = {
      ...SigningPerson,
      dob: new Date(SigningPerson.dob)
    };
  }

  return await prisma.client.update({
    where: { id: Number(id) },
    data: {
      ...formattedData,
      SigningPerson: formattedSigningPerson
        ? { upsert: { create: formattedSigningPerson, update: formattedSigningPerson } }
        : undefined,
    },
    select: aopSelect,
  });
};

const deleteAop = async (id) => {
  return await prisma.client.delete({
    where: { id: Number(id) },
  });
};

module.exports = { createAop, getAllAop, getAopById, updateAop, deleteAop };