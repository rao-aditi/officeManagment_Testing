const { z } = require("zod");

const dateSchema = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
  .nullish();

const signingPersonSchema = z.object({
  name:        z.string().min(1, "Signing person name is required"),
  fatherName:  z.string().nullish(),
  designation: z.string().nullish(),
  gender:      z.enum(["MALE", "FEMALE", "OTHER"]).nullish(),
  panNo:       z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN").nullish(),
  dob:         dateSchema,
});

const boiSchema = z.object({
  // identifiers
  code:  z.string().nullish(),
  group: z.string().nullish(),

  // Personal Information
  prefix:          z.string().nullish(),
  name:            z.string().min(1, "Name is required"),
  dateOfFormation: dateSchema,
  residentialStatus: z
    .enum(["RESIDENT", "NON_RESIDENT", "NOT_ORDINARILY_RESIDENT"])
    .nullish(),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN").nullish(),
  tan: z.string().nullish(),
  dateOfCommencementOfBusiness: dateSchema,
  isFIIFPI:   z.enum(["YES", "NO"]).nullish(),
  sebiRegnNo: z.string().nullish(),

  // MSME
  isMSME:               z.enum(["YES", "NO"]).nullish(),
  msmeRegistrationNo:   z.string().nullish(),
  msmeRegistrationDate: dateSchema,
  enterpriseType: z.enum(["MICRO", "SMALL", "MEDIUM"]).nullish(),
  majorActivity:  z.enum(["MANUFACTURING", "SERVICES", "TRADING"]).nullish(),

  // Business Information
  businessName:  z.string().nullish(),
  contactPerson: z.string().nullish(),
  natureOfBusiness: z.enum([
    "EXPORT", "MANUFACTURING", "MANUFACTURING_AND_TRADING", "RETAIL_TRADING",
    "WHOLESALE_BUSINESS", "WHOLESALE_CUM_RETAIL", "CONSTRUCTION_BUSINESS",
    "SERVICE_PROVIDER", "FINANCING_SERVICES", "SHARES_AND_BROKERAGE",
    "IMPORT", "LESSOR", "LESSEE", "WORK_CONTRACTOR",
  ]).nullish(),
  stockValuationMethod: z.enum([
    "COST_PRICE", "MARKET_PRICE", "AVERAGE_COST_METHOD",
    "COST_OR_MARKET_WHICHEVER_LESS", "FIFO", "LIFO",
  ]).nullish(),

  // GST
  gstNo:        z.string().nullish(),
  gstStartDate: dateSchema,
  gstEndDate:   dateSchema,

  // Other Registrations
  vatRegNo:          z.string().nullish(),
  centralSalesTaxNo: z.string().nullish(),
  serviceTaxRegNo:   z.string().nullish(),
  otherRegistration: z.string().nullish(),

  // LLP
  isLLP: z.boolean().default(false),
  llpId: z.string().nullish(),

  // Signing Person
  signingPerson: signingPersonSchema.optional(),
});

const updateBoiSchema = boiSchema.partial().extend({
  signingPerson: signingPersonSchema.optional(),
});

module.exports = { boiSchema, updateBoiSchema };