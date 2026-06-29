const { z } = require("zod");

// Common Date Schema
const dateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z)?$/,
    "Date must be in YYYY-MM-DD or ISO format"
  )
  .or(z.literal(""))
  .or(z.null())
  .optional();
// PAN Regex
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// Main AOP Schema
const aopSchema = z.object({
  // ─────────────────────────────
  // Identifiers
  // ─────────────────────────────
  code: z.string().nullable().optional(),
  group: z.string().nullable().optional(),

  // ─────────────────────────────
  // Personal Information
  // ─────────────────────────────
  prefix: z.string().nullable().optional(),

  name: z.string().trim().min(1, "Name is required"),

  dateOfFormation: dateSchema,

  residentialStatus: z
    .enum([
      "RESIDENT",
      "NON_RESIDENT",
      "NOT_ORDINARILY_RESIDENT",
    ])
    .nullable()
    .optional(),

  pan: z
    .string()
    .regex(panRegex, "Invalid PAN number")
    .nullable()
    .optional(),

  tan: z.string().nullable().optional(),

  dateOfCommencementOfBusiness: dateSchema,

  isFIIFPI: z.enum(["YES", "NO"]).nullable().optional(),

  sebiRegnNo: z.string().nullable().optional(),

  // ─────────────────────────────
  // MSME
  // ─────────────────────────────
  isMSME: z.enum(["YES", "NO"]).nullable().optional(),

  msmeRegistrationNo: z.string().nullable().optional(),

  msmeRegistrationDate: dateSchema,

  enterpriseType: z
    .enum(["MICRO", "SMALL", "MEDIUM"])
    .nullable()
    .optional(),

  majorActivity: z
    .enum(["MANUFACTURING", "SERVICES", "TRADING"])
    .nullable()
    .optional(),

  // ─────────────────────────────
  // Business Information
  // ─────────────────────────────
  businessName: z.string().nullable().optional(),

  contactPerson: z.string().nullable().optional(),

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
    .nullable()
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
    .nullable()
    .optional(),

  // ─────────────────────────────
  // GST
  // ─────────────────────────────
  gstNo: z.string().nullable().optional(),

  gstStartDate: dateSchema,

  gstEndDate: dateSchema,

  // ─────────────────────────────
  // Other Registrations
  // ─────────────────────────────
  vatRegNo: z.string().nullable().optional(),

  centralSalesTaxNo: z.string().nullable().optional(),

  serviceTaxRegNo: z.string().nullable().optional(),

  otherRegistration: z.string().nullable().optional(),

  // ─────────────────────────────
  // LLP
  // ─────────────────────────────
  isLLP: z.boolean().default(false),

  llpId: z.string().nullable().optional(),

  // ─────────────────────────────
  // Signing Person
  // ─────────────────────────────
  signingPerson: z
    .object({
      name: z.string().trim().min(1, "Signing person name is required"),

      fatherName: z.string().nullable().optional(),

      designation: z.string().nullable().optional(),

      gender: z
        .enum(["MALE", "FEMALE", "OTHER"])
        .nullable()
        .optional(),

      panNo: z
        .string()
        .regex(panRegex, "Invalid PAN number")
        .nullable()
        .optional(),

      dob: dateSchema,
    })
    .optional(),
});

// CREATE Validation
const createAopValidation = (data) => {
  return aopSchema.safeParse(data);
};

// UPDATE Validation
const updateAopValidation = (data) => {
  return aopSchema.partial({ name: true }).safeParse(data);
};

module.exports = {
  createAopValidation,
  updateAopValidation,
};