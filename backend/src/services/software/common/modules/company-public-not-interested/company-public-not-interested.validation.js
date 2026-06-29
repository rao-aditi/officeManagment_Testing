
const { z } = require("zod");

const signingPersonSchema = z.object({
  name: z.string().optional(),

  fatherName: z.string().optional(),

  designation: z.string().optional(),

  gender: z.string().optional(),

  panNo: z.string().optional(),

  dob: z.string().optional(),
});

const companyPublicNotInterestedSchema =
  z.object({
    code: z.string().optional(),

    group: z.string().optional(),

    prefix: z.string().optional(),

    name: z.string().min(1),

    dateOfIncorporation:
      z.string().optional(),

    residentialStatus:
      z.string().optional(),

    pan: z.string().optional(),

    tan: z.string().optional(),

    dateOfCommencementOfBusiness:
      z.string().optional(),

    isFIIFPI: z.string().optional(),

    sebiRegnNo:
      z.string().nullable().optional(),

    isMSME: z.string().optional(),

    msmeRegistrationNo:
      z.string().optional(),

    msmeRegistrationDate:
      z.string().optional(),

    enterpriseType:
      z.string().optional(),

    majorActivity:
      z.string().optional(),

    businessName:
      z.string().optional(),

    contactPerson:
      z.string().optional(),

    natureOfBusiness:
      z.string().optional(),

    stockValuationMethod:
      z.string().optional(),

    gstNo: z.string().optional(),

    gstStartDate:
      z.string().optional(),

    gstEndDate:
      z.string().nullable().optional(),

    vatRegNo:
      z.string().nullable().optional(),

    centralSalesTaxNo:
      z.string().nullable().optional(),

    serviceTaxRegNo:
      z.string().nullable().optional(),

    otherRegistration:
      z.string().nullable().optional(),

    isLLP: z.boolean().optional(),

    llpId:
      z.string().nullable().optional(),

    oldCompanyName:
      z.string().optional(),

    registrarOfCompanyId:
      z.number().optional(),

    cin: z.string().optional(),

    gln: z.string().optional(),

    companyCategory:
      z.string().optional(),

    companySub:
      z.string().optional(),

    companyCategoryOtherSpecify:
      z.string().nullable().optional(),

    sec8LicenceNo:
      z.string().nullable().optional(),

    companyType:
      z.string().optional(),

    havingShareCapital:
      z.boolean().optional(),

    isPrivateOnePersonCompany:
      z.boolean().optional(),

    signingPerson:
      signingPersonSchema.optional(),
  });

module.exports = {
  companyPublicNotInterestedSchema,
};
