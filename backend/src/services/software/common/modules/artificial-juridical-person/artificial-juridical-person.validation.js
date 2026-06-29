const { z } = require(
  "zod"
);

const createArtificialJuridicalPersonValidation =
  z.object({
    body: z.object({
      code:
        z.string().optional(),

      group:
        z.string().optional(),

      prefix:
        z.string().optional(),

      name:
        z.string(),

      dateOfFormation:
        z.string().optional(),

      residentialStatus:
        z.string().optional(),

      pan:
        z.string().optional(),

      tan:
        z.string().optional(),

      dateOfCommencementOfBusiness:
        z.string().optional(),

      isFIIFPI:
        z.string().optional(),

      sebiRegnNo:
        z.string().optional(),

      isMSME:
        z.string().optional(),

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

      gstNo:
        z.string().optional(),

      gstStartDate:
        z.string().optional(),

      gstEndDate:
        z.string().optional(),

      vatRegNo:
        z.string().optional(),

      centralSalesTaxNo:
        z.string().optional(),

      serviceTaxRegNo:
        z.string().optional(),

      otherRegistration:
        z.string().optional(),

      isLLP:
        z.boolean().optional(),

      llpId:
        z.string().optional(),

      signingPerson:
        z
          .object({
            name:
              z.string(),

            fatherName:
              z
                .string()
                .optional(),

            designation:
              z
                .string()
                .optional(),

            gender:
              z
                .string()
                .optional(),

            panNo:
              z
                .string()
                .optional(),

            dob:
              z
                .string()
                .optional(),
          })
          .optional(),
    }),
  });

const updateArtificialJuridicalPersonValidation =
  z.object({
    body:
      createArtificialJuridicalPersonValidation.shape.body.partial(),
  });

module.exports = {
  createArtificialJuridicalPersonValidation,
  updateArtificialJuridicalPersonValidation,
};