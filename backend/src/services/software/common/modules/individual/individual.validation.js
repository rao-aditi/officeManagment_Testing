const { z } = require("zod");

const individualSchema = z.object({
  // ── Top level ──
  code: z.string().optional(),
  group: z.string().optional(),

  // ── Personal Information ──
  prefix: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  fatherName: z.string().optional(),
  spouseName: z.string().optional(),

  qualification: z.string().optional(),
  nationality: z.string().optional(),
  occupation: z.string().optional(),
  uinNo: z.string().optional(),
  nameAsPerUIN: z.string().optional(),
  mobileLinkedWithUIN: z.string().optional(),

  // ── Identity & Passport ──
  passportStatus: z.enum(["YES", "NO", "NA"]).optional(),
  passportNumber: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  votersId: z.string().optional(),

  dob: z.coerce.date().nullable().optional(),
  dod: z.coerce.date().nullable().optional(),

  residentialStatus: z
    .enum([
      "RESIDENT",
      "NON_RESIDENT",
      "NOT_ORDINARILY_RESIDENT",
    ])
    .optional(),

  pan: z.string().optional(),
  tan: z.string().optional(),
  din: z.string().optional(),

  dateOfCommencementOfBusiness: z.coerce
    .date()
    .nullable()
    .optional(),

  isFIIFPI: z.enum(["YES", "NO"]).optional(),
  sebiRegnNo: z.string().nullable().optional(),

  // ── MSME / Udyam ──
  isMSME: z.enum(["YES", "NO"]).optional(),

  msmeRegistrationNo: z.string().optional(),

  msmeRegistrationDate: z.coerce
    .date()
    .nullable()
    .optional(),

  enterpriseType: z
    .enum(["MICRO", "SMALL", "MEDIUM"])
    .optional(),

  majorActivity: z
    .enum(["MANUFACTURING", "SERVICES", "TRADING"])
    .optional(),

  // ── Business Information ──
  businessName: z.string().optional(),
  contactPerson: z.string().optional(),

  natureOfBusiness: z
    .enum([
      "EXPORT",
      "MANUFACTURING",
      "MANUFACTURING_AND_TRADING",
      "RETAIL_TRADING",
      "WHOLESALE_BUSINESS",
      "WHOLESALE_CUM_RETAIL",
      "CONSTRUCTION_BUSINESS",
      "SERVICE_PROVIDER",
      "FINANCING_SERVICES",
      "SHARES_AND_BROKERAGE",
      "IMPORT",
      "LESSOR",
      "LESSEE",
      "WORK_CONTRACTOR",
    ])
    .optional(),

  stockValuationMethod: z
    .enum([
      "COST_PRICE",
      "MARKET_PRICE",
      "AVERAGE_COST_METHOD",
      "COST_OR_MARKET_WHICHEVER_LESS",
      "FIFO",
      "LIFO",
    ])
    .optional(),

  // ── GST Registration ──
  gstNo: z.string().optional(),

  gstStartDate: z.coerce
    .date()
    .nullable()
    .optional(),

  gstEndDate: z.coerce
    .date()
    .nullable()
    .optional(),

  // ── Other Registrations ──
  vatRegNo: z.string().optional(),
  centralSalesTaxNo: z.string().optional(),
  serviceTaxRegNo: z.string().optional(),
  otherRegistration: z.string().nullable().optional(),

  // ── Signing Person ──
  signingPerson: z
    .object({
      name: z.string().min(1, "Signing person name is required"),
      fatherName: z.string().optional(),
      designation: z.string().optional(),

      gender: z
        .enum(["MALE", "FEMALE", "OTHER"])
        .optional(),

      panNo: z.string().optional(),

      dob: z.coerce
        .date()
        .nullable()
        .optional(),
    })
    .optional(),
});

const updateIndividualSchema = individualSchema.partial();

module.exports = {
  individualSchema,
  updateIndividualSchema,
};