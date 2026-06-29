const { z } = require("zod");

const hufSchema = z.object({
  // ─────────────────────────────
  // Top Level
  // ─────────────────────────────
  code: z.string().optional(),

  group: z.string().optional(),

  // ─────────────────────────────
  // Personal Information
  // ─────────────────────────────
  prefix: z.string().optional(),

  name: z
    .string()
    .min(1, "Name is required"),

  dateOfFormation: z.string().optional(),

  // ─────────────────────────────
  // Identity
  // ─────────────────────────────
  residentialStatus: z
    .enum([
      "RESIDENT",
      "NON_RESIDENT",
      "NOT_ORDINARILY_RESIDENT",
    ])
    .optional(),

  pan: z.string().optional(),

  tan: z.string().optional(),

  dateOfCommencementOfBusiness: z
    .string()
    .optional(),

  // ─────────────────────────────
  // MSME / Udyam
  // ─────────────────────────────
  isMSME: z
    .enum(["YES", "NO"])
    .optional(),

  msmeRegistrationNo: z
    .string()
    .optional(),

  msmeRegistrationDate: z
    .string()
    .optional(),

  enterpriseType: z
    .enum([
      "MICRO",
      "SMALL",
      "MEDIUM",
    ])
    .optional(),

  majorActivity: z
    .enum([
      "MANUFACTURING",
      "SERVICES",
      "TRADING",
    ])
    .optional(),

  // ─────────────────────────────
  // Business Information
  // ─────────────────────────────
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

  // ─────────────────────────────
  // GST Registration
  // ─────────────────────────────
  gstNo: z.string().optional(),

  gstStartDate: z
    .string()
    .optional(),

  gstEndDate: z
    .string()
    .optional(),

  // ─────────────────────────────
  // Other Registrations
  // ─────────────────────────────
  vatRegNo: z.string().optional(),

  centralSalesTaxNo: z.string().optional(),

  serviceTaxRegNo: z.string().optional(),

  otherRegistration: z.string().optional(),

  // ─────────────────────────────
  // Signing Person
  // ─────────────────────────────
  signingPerson: z
    .object({
      name: z
        .string()
        .min(1, "Signing person name is required"),

      fatherName: z.string().optional(),

      designation: z.string().optional(),

      gender: z
        .enum([
          "MALE",
          "FEMALE",
          "OTHER",
        ])
        .optional(),

      panNo: z.string().optional(),

      dob: z
        .string()
        .optional(),
    })
    .optional(),
});

const updateHufSchema = hufSchema.partial();

module.exports = {
  hufSchema,
  updateHufSchema,
};