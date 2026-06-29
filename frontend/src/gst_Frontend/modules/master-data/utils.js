import { STATUS_OPTIONS } from "./constants";
import { ENTITY_TYPE_TO_STATUS } from "@/gst_Frontend/config/entityEndpoints";

// ✅ Converts "YYYY-MM-DD" → "YYYY-MM-DDT00:00:00.000Z" for Prisma DateTime fields
function toISODate(value) {
  if (!value || value === "") return undefined;
  const date = new Date(value);
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function getStatusLabel(code) {
  const s = STATUS_OPTIONS.find(o => o.code === code);
  return s ? `[${s.code}] ${s.label}` : code;
}

export function validate(form) {
  const errors = {};
  if (!form.code) errors.code = "Required";
  if (!form.name)   errors.name   = "Required";
  if (form.status === "01" && !form.firstName) errors.firstName = "Required";
  if (form.status === "01" && !form.lastName) errors.lastName = "Required";
  if (!form.pan)    errors.pan    = "Required";
  else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan.toUpperCase()))
    errors.pan = "Invalid PAN format (e.g. ABCDE1234F)";
  if (!form.status) errors.status = "Select a status";
  return errors;
}

export function getStatusFromRecord(record) {
  return record.status
    || (ENTITY_TYPE_TO_STATUS && ENTITY_TYPE_TO_STATUS[record.entityType])
    || "";
}

export function toTableRecord(record) {
  if (!record || typeof record !== "object") return {};
  return {
    ...record,
    codeNo: record.code || "",
    fatherName: record.fatherName || record.SigningPerson?.name || "",
    pan: record.pan || "",
    status: getStatusFromRecord(record),
  };
}

export function buildClientPayload(form) {
  const optional = value => value === "" || value == null ? undefined : value;
  const pan = form.pan ? form.pan.toUpperCase() : undefined;

  const basePayload = {
    code: String(form.code || "").trim(),
    group: optional(form.group),
    name: String(form.name || "").trim(),
    fatherName: form.fatherName || undefined,
    pan,
  };

  // ── Signing person builder (reused across statuses) ──────────────────────
  const SigningPerson = form.SigningPersonName ? {
    name: form.SigningPersonName,
    fatherName: optional(form.SigningPersonFatherName),
    designation: optional(form.SigningPersonDesignation),
    gender: optional(form.SigningPersonGender),
    panNo: form.SigningPersonPanNo ? form.SigningPersonPanNo.toUpperCase() : undefined,
    dob: toISODate(form.SigningPersonDob),
  } : undefined;

  // ── 01 Individual ─────────────────────────────────────────────────────────
  if (form.status === "01") {
    const nameParts = basePayload.name.split(/\s+/).filter(Boolean);
    return {
      ...basePayload,
      prefix: optional(form.prefix),
      firstName: form.firstName || nameParts[0] || basePayload.name,
      middleName: form.middleName || undefined,
      lastName: form.lastName || nameParts.slice(1).join(" ") || nameParts[0] || basePayload.name,
      spouseName: optional(form.spouseName),
      qualification: optional(form.qualification),
      nationality: optional(form.nationality),
      occupation: optional(form.occupation),
      uinNo: optional(form.uinNo),
      nameAsPerUIN: optional(form.nameAsPerUIN),
      mobileLinkedWithUIN: optional(form.mobileLinkedWithUIN),
      passportStatus: optional(form.passportStatus),
      passportNumber: optional(form.passportNumber),
      gender: optional(form.gender),
      votersId: optional(form.votersId),
      dob: toISODate(form.dob),
      dod: toISODate(form.dod),
      residentialStatus: optional(form.residentialStatus),
      tan: optional(form.tan),
      din: optional(form.din),
      dateOfCommencementOfBusiness: toISODate(form.dateOfCommencementOfBusiness),
      isFIIFPI: optional(form.isFIIFPI),
      sebiRegnNo: optional(form.sebiRegnNo),
      isMSME: optional(form.isMSME),
      msmeRegistrationNo: optional(form.msmeRegistrationNo),
      msmeRegistrationDate: toISODate(form.msmeRegistrationDate),
      enterpriseType: optional(form.enterpriseType),
      majorActivity: optional(form.majorActivity),
      businessName: optional(form.businessName),
      contactPerson: optional(form.contactPerson),
      natureOfBusiness: optional(form.natureOfBusiness),
      stockValuationMethod: optional(form.stockValuationMethod),
      gstNo: optional(form.gstNo),
      gstStartDate: toISODate(form.gstStartDate),
      gstEndDate: toISODate(form.gstEndDate),
      vatRegNo: optional(form.vatRegNo),
      centralSalesTaxNo: optional(form.centralSalesTaxNo),
      serviceTaxRegNo: optional(form.serviceTaxRegNo),
      otherRegistration: optional(form.otherRegistration),
      SigningPerson,
    };
  }

  // ── 03 HUF ────────────────────────────────────────────────────────────────
  if (form.status === "03") {
    return {
      ...basePayload,
      dateOfFormation: toISODate(form.dateOfFormation),
      residentialStatus: optional(form.residentialStatus),
      tan: optional(form.tan),
      dateOfCommencementOfBusiness: toISODate(form.dateOfCommencementOfBusiness),
      isMSME: optional(form.isMSME),
      msmeRegistrationNo: optional(form.msmeRegistrationNo),
      msmeRegistrationDate: toISODate(form.msmeRegistrationDate),
      enterpriseType: optional(form.enterpriseType),
      majorActivity: optional(form.majorActivity),
      businessName: optional(form.businessName),
      contactPerson: optional(form.contactPerson),
      natureOfBusiness: optional(form.natureOfBusiness),
      stockValuationMethod: optional(form.stockValuationMethod),
      gstNo: optional(form.gstNo),
      gstStartDate: toISODate(form.gstStartDate),
      gstEndDate: toISODate(form.gstEndDate),
      vatRegNo: optional(form.vatRegNo),
      centralSalesTaxNo: optional(form.centralSalesTaxNo),
      serviceTaxRegNo: optional(form.serviceTaxRegNo),
      otherRegistration: optional(form.otherRegistration),
      SigningPerson,
    };
  }

  // ── 05 Firm ───────────────────────────────────────────────────────────────
  if (form.status === "05") {
    return {
      ...basePayload,
      dateOfDeed: toISODate(form.dateOfDeed),
      residentialStatus: optional(form.residentialStatus),
      tan: optional(form.tan),
      dateOfCommencementOfBusiness: toISODate(form.dateOfCommencementOfBusiness),
      isFIIFPI: optional(form.isFIIFPI),
      sebiRegnNo: optional(form.sebiRegnNo),
      isMSME: optional(form.isMSME),
      msmeRegistrationNo: optional(form.msmeRegistrationNo),
      msmeRegistrationDate: toISODate(form.msmeRegistrationDate),
      enterpriseType: optional(form.enterpriseType),
      majorActivity: optional(form.majorActivity),
      businessName: optional(form.businessName),
      contactPerson: optional(form.contactPerson),
      natureOfBusiness: optional(form.natureOfBusiness),
      stockValuationMethod: optional(form.stockValuationMethod),
      gstNo: optional(form.gstNo),
      gstStartDate: toISODate(form.gstStartDate),
      gstEndDate: toISODate(form.gstEndDate),
      vatRegNo: optional(form.vatRegNo),
      centralSalesTaxNo: optional(form.centralSalesTaxNo),
      serviceTaxRegNo: optional(form.serviceTaxRegNo),
      otherRegistration: optional(form.otherRegistration),
      isLLP: form.isLLP === "YES",
      llpId: optional(form.llpId),
      SigningPerson,
    };
  }

  // ── 07 AOP ────────────────────────────────────────────────────────────────
  if (form.status === "07") {
    return {
      ...basePayload,
      dateOfFormation: toISODate(form.dateOfFormation),
      residentialStatus: optional(form.residentialStatus),
      tan: optional(form.tan),
      dateOfCommencementOfBusiness: toISODate(form.dateOfCommencementOfBusiness),
      isFIIFPI: optional(form.isFIIFPI),
      sebiRegnNo: optional(form.sebiRegnNo),
      isMSME: optional(form.isMSME),
      msmeRegistrationNo: optional(form.msmeRegistrationNo),
      msmeRegistrationDate: toISODate(form.msmeRegistrationDate),
      enterpriseType: optional(form.enterpriseType),
      majorActivity: optional(form.majorActivity),
      businessName: optional(form.businessName),
      contactPerson: optional(form.contactPerson),
      natureOfBusiness: optional(form.natureOfBusiness),
      stockValuationMethod: optional(form.stockValuationMethod),
      gstNo: optional(form.gstNo),
      gstStartDate: toISODate(form.gstStartDate),
      gstEndDate: toISODate(form.gstEndDate),
      vatRegNo: optional(form.vatRegNo),
      centralSalesTaxNo: optional(form.centralSalesTaxNo),
      serviceTaxRegNo: optional(form.serviceTaxRegNo),
      otherRegistration: optional(form.otherRegistration),
      isLLP: form.isLLP === "YES",
      llpId: optional(form.llpId),
      SigningPerson,
    };
  }

  // ── 08 AOP Trust ──────────────────────────────────────────────────────────
  if (form.status === "08") {
    return {
      ...basePayload,
      dateOfFormation: toISODate(form.dateOfFormation),
      residentialStatus: optional(form.residentialStatus),
      tan: optional(form.tan),
      dateOfCommencementOfBusiness: toISODate(form.dateOfCommencementOfBusiness),
      isMSME: optional(form.isMSME),
      msmeRegistrationNo: optional(form.msmeRegistrationNo),
      msmeRegistrationDate: toISODate(form.msmeRegistrationDate),
      enterpriseType: optional(form.enterpriseType),
      majorActivity: optional(form.majorActivity),
      businessName: optional(form.businessName),
      contactPerson: optional(form.contactPerson),
      natureOfBusiness: optional(form.natureOfBusiness),
      stockValuationMethod: optional(form.stockValuationMethod),
      gstNo: optional(form.gstNo),
      gstStartDate: toISODate(form.gstStartDate),
      gstEndDate: toISODate(form.gstEndDate),
      vatRegNo: optional(form.vatRegNo),
      centralSalesTaxNo: optional(form.centralSalesTaxNo),
      serviceTaxRegNo: optional(form.serviceTaxRegNo),
      otherRegistration: optional(form.otherRegistration),
      isLLP: form.isLLP === "YES",
      llpId: optional(form.llpId),
      SigningPerson,
    };
  }

  // ── 09 Body of Individual ─────────────────────────────────────────────────
  if (form.status === "09") {
    return {
      ...basePayload,
      dateOfFormation: toISODate(form.dateOfFormation),
      residentialStatus: optional(form.residentialStatus),
      tan: optional(form.tan),
      dateOfCommencementOfBusiness: toISODate(form.dateOfCommencementOfBusiness),
      isFIIFPI: optional(form.isFIIFPI),
      sebiRegnNo: optional(form.sebiRegnNo),
      isMSME: optional(form.isMSME),
      msmeRegistrationNo: optional(form.msmeRegistrationNo),
      msmeRegistrationDate: toISODate(form.msmeRegistrationDate),
      enterpriseType: optional(form.enterpriseType),
      majorActivity: optional(form.majorActivity),
      businessName: optional(form.businessName),
      contactPerson: optional(form.contactPerson),
      natureOfBusiness: optional(form.natureOfBusiness),
      stockValuationMethod: optional(form.stockValuationMethod),
      gstNo: optional(form.gstNo),
      gstStartDate: toISODate(form.gstStartDate),
      gstEndDate: toISODate(form.gstEndDate),
      vatRegNo: optional(form.vatRegNo),
      centralSalesTaxNo: optional(form.centralSalesTaxNo),
      serviceTaxRegNo: optional(form.serviceTaxRegNo),
      otherRegistration: optional(form.otherRegistration),
      isLLP: form.isLLP === "YES",
      llpId: optional(form.llpId),
      SigningPerson,
    };
  }

  // ── 10 Artificial Juridical Person ────────────────────────────────────────
  if (form.status === "10") {
    return {
      ...basePayload,
      dateOfFormation: toISODate(form.dateOfFormation),
      residentialStatus: optional(form.residentialStatus),
      tan: optional(form.tan),
      dateOfCommencementOfBusiness: toISODate(form.dateOfCommencementOfBusiness),
      isFIIFPI: optional(form.isFIIFPI),
      sebiRegnNo: optional(form.sebiRegnNo),
      isMSME: optional(form.isMSME),
      msmeRegistrationNo: optional(form.msmeRegistrationNo),
      msmeRegistrationDate: toISODate(form.msmeRegistrationDate),
      enterpriseType: optional(form.enterpriseType),
      majorActivity: optional(form.majorActivity),
      businessName: optional(form.businessName),
      contactPerson: optional(form.contactPerson),
      natureOfBusiness: optional(form.natureOfBusiness),
      stockValuationMethod: optional(form.stockValuationMethod),
      gstNo: optional(form.gstNo),
      gstStartDate: toISODate(form.gstStartDate),
      gstEndDate: toISODate(form.gstEndDate),
      vatRegNo: optional(form.vatRegNo),
      centralSalesTaxNo: optional(form.centralSalesTaxNo),
      serviceTaxRegNo: optional(form.serviceTaxRegNo),
      otherRegistration: optional(form.otherRegistration),
      isLLP: form.isLLP === "YES",
      llpId: optional(form.llpId),
      SigningPerson,
    };
  }

  // ── 11 Co-Operative Society ───────────────────────────────────────────────
  if (form.status === "11") {
    return {
      ...basePayload,
      prefix: optional(form.prefix),
      dateOfFormation: toISODate(form.dateOfFormation),
      residentialStatus: optional(form.residentialStatus),
      tan: optional(form.tan),
      dateOfCommencementOfBusiness: toISODate(form.dateOfCommencementOfBusiness),
      isFIIFPI: optional(form.isFIIFPI),
      sebiRegnNo: optional(form.sebiRegnNo),
      isMSME: optional(form.isMSME),
      msmeRegistrationNo: optional(form.msmeRegistrationNo),
      msmeRegistrationDate: toISODate(form.msmeRegistrationDate),
      enterpriseType: optional(form.enterpriseType),
      majorActivity: optional(form.majorActivity),
      businessName: optional(form.businessName),
      contactPerson: optional(form.contactPerson),
      natureOfBusiness: optional(form.natureOfBusiness),
      stockValuationMethod: optional(form.stockValuationMethod),
      gstNo: optional(form.gstNo),
      gstStartDate: toISODate(form.gstStartDate),
      gstEndDate: toISODate(form.gstEndDate),
      vatRegNo: optional(form.vatRegNo),
      centralSalesTaxNo: optional(form.centralSalesTaxNo),
      serviceTaxRegNo: optional(form.serviceTaxRegNo),
      otherRegistration: optional(form.otherRegistration),
      isLLP: form.isLLP === "YES",
      llpId: optional(form.llpId),
      SigningPerson,
    };
  }

  // ── Shared company fields builder (12, 13, 14, 16) ────────────────────────
  const companyFields = {
    dateOfIncorporation: toISODate(form.dateOfIncorporation),
    residentialStatus: optional(form.residentialStatus),
    tan: optional(form.tan),
    dateOfCommencementOfBusiness: toISODate(form.dateOfCommencementOfBusiness),
    isFIIFPI: optional(form.isFIIFPI),
    sebiRegnNo: optional(form.sebiRegnNo),
    isMSME: optional(form.isMSME),
    msmeRegistrationNo: optional(form.msmeRegistrationNo),
    msmeRegistrationDate: toISODate(form.msmeRegistrationDate),
    enterpriseType: optional(form.enterpriseType),
    majorActivity: optional(form.majorActivity),
    businessName: optional(form.businessName),
    contactPerson: optional(form.contactPerson),
    natureOfBusiness: optional(form.natureOfBusiness),
    stockValuationMethod: optional(form.stockValuationMethod),
    gstNo: optional(form.gstNo),
    gstStartDate: toISODate(form.gstStartDate),
    gstEndDate: toISODate(form.gstEndDate),
    vatRegNo: optional(form.vatRegNo),
    centralSalesTaxNo: optional(form.centralSalesTaxNo),
    serviceTaxRegNo: optional(form.serviceTaxRegNo),
    otherRegistration: optional(form.otherRegistration),
    isLLP: form.isLLP === "YES",
    llpId: optional(form.llpId),
    oldCompanyName: optional(form.oldCompanyName),
    registrarOfCompanyId: form.registrarOfCompanyId ? Number(form.registrarOfCompanyId) : undefined,
    cin: optional(form.cin),
    gln: optional(form.gln),
    companyCategory: optional(form.companyCategory),
    companySub: optional(form.companySub),
    companyCategoryOtherSpecify: optional(form.companyCategoryOtherSpecify),
    sec8LicenceNo: optional(form.sec8LicenceNo),
    companyType: optional(form.companyType),
    havingShareCapital: form.havingShareCapital === "YES",
    isPrivateOnePersonCompany: form.isPrivateOnePersonCompany === "YES",
    SigningPerson,
  };

  // ── 12 Company Public Interested ──────────────────────────────────────────
  if (form.status === "12") {
    return { ...basePayload, ...companyFields };
  }

  // ── 13 Company Public Not Interested ──────────────────────────────────────
  if (form.status === "13") {
    return { ...basePayload, ...companyFields };
  }

  // ── 14 Company Private ────────────────────────────────────────────────────
  if (form.status === "14") {
    return { ...basePayload, ...companyFields };
  }

  // ── 16 Local Authority ────────────────────────────────────────────────────
  if (form.status === "16") {
    return { ...basePayload, ...companyFields };
  }

  return basePayload;
}

export const searchInputStyle = {
  width: "100%", boxSizing: "border-box",
  padding: "3px 7px", fontSize: 12,
  border: "1px solid #c5cfd8", borderRadius: 3,
  outline: "none", background: "#fff",
};