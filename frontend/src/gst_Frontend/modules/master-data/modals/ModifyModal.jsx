import { useState, useEffect } from "react";
import { EMPTY_FORM } from "@/gst_Frontend/modules/master-data/constants";
import { buildClientPayload, validate } from "@/gst_Frontend/modules/master-data/utils";
import Overlay from "@/gst_Frontend/components/shared/Overlay";
import ModalHeader from "@/gst_Frontend/components/shared/ModalHeader";
import FormField from "@/gst_Frontend/components/shared/FormField";
import ActionBtn from "@/gst_Frontend/components/shared/ActionBtn";
import CommonFields from "@/gst_Frontend/modules/master-data/form-sections/CommonFields";
import IndividualFields from "@/gst_Frontend/modules/master-data/form-sections/IndividualFields";
import HufFields from "@/gst_Frontend/modules/master-data/form-sections/HufFields";
import FirmFields from "@/gst_Frontend/modules/master-data/form-sections/FirmFields";
import AopFields from "@/gst_Frontend/modules/master-data/form-sections/AopFields";
import AopTrustFields from "@/gst_Frontend/modules/master-data/form-sections/AopTrustFields";
import BodyofIndividualFields from "@/gst_Frontend/modules/master-data/form-sections/BodyOfIndividualFields";
import ArtificialJuridicalFields from "@/gst_Frontend/modules/master-data/form-sections/ArtificialJuridicalPersonFields";
import CooperativeSocietyFields from "@/gst_Frontend/modules/master-data/form-sections/CooperativeSocietyFields";
import CompanyPublicInterestedFields from "@/gst_Frontend/modules/master-data/form-sections/CompanyPublicInterestedFields";
import CompanyPublicNotInterestedFields from "@/gst_Frontend/modules/master-data/form-sections/CompanyPublicNotInterested";
import CompanyPrivateFields from "@/gst_Frontend/modules/master-data/form-sections/CompanyPrivate";
import LocalAuthorityFields from "@/gst_Frontend/modules/master-data/form-sections/LocalAuthorityFields";

// Map status to extra fields component
const EXTRA_FIELDS = {
  "01": IndividualFields,
  "03": HufFields,
  "05": FirmFields,
  "07": AopFields,
  "08": AopTrustFields,
  "09": BodyofIndividualFields,
  "10": ArtificialJuridicalFields,
  "11": CooperativeSocietyFields,
  "12": CompanyPublicInterestedFields,
  "13": CompanyPublicNotInterestedFields,
  "14": CompanyPrivateFields,
  "16": LocalAuthorityFields,
};

// Helper function to format date for input fields (YYYY-MM-DD)
function formatDateForInput(dateValue) {
  if (!dateValue) return "";
  
  // If it's already in YYYY-MM-DD format
  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }
  
  // If it's an ISO string with time (2015-04-01T00:00:00.000Z)
  if (typeof dateValue === "string" && dateValue.includes("T")) {
    return dateValue.split("T")[0];
  }
  
  // If it's a Date object
  if (dateValue instanceof Date) {
    return dateValue.toISOString().split("T")[0];
  }
  
  return dateValue;
}

// Function to convert record back to form format
function recordToForm(record) {
  const form = {
    ...EMPTY_FORM,
    id: record.id,
    code: record.codeNo || record.code,
    name: record.name,
    fatherName: record.fatherName || "",
    pan: record.pan || "",
    status: record.status,
    group: record.group || "",
    address: record.address || "",
  };

  // Map common fields with date formatting
  if (record.prefix) form.prefix = record.prefix;
  if (record.dateOfFormation) form.dateOfFormation = formatDateForInput(record.dateOfFormation);
  if (record.dateOfDeed) form.dateOfDeed = formatDateForInput(record.dateOfDeed);
  if (record.residentialStatus) form.residentialStatus = record.residentialStatus;
  if (record.tan) form.tan = record.tan;
  if (record.dateOfCommencementOfBusiness) form.dateOfCommencementOfBusiness = formatDateForInput(record.dateOfCommencementOfBusiness);
  if (record.isFIIFPI) form.isFIIFPI = record.isFIIFPI;
  if (record.sebiRegnNo) form.sebiRegnNo = record.sebiRegnNo;
  
  // MSME fields with date formatting
  if (record.isMSME) form.isMSME = record.isMSME;
  if (record.msmeRegistrationNo) form.msmeRegistrationNo = record.msmeRegistrationNo;
  if (record.msmeRegistrationDate) form.msmeRegistrationDate = formatDateForInput(record.msmeRegistrationDate);
  if (record.enterpriseType) form.enterpriseType = record.enterpriseType;
  if (record.majorActivity) form.majorActivity = record.majorActivity;
  
  // Business fields
  if (record.businessName) form.businessName = record.businessName;
  if (record.contactPerson) form.contactPerson = record.contactPerson;
  if (record.natureOfBusiness) form.natureOfBusiness = record.natureOfBusiness;
  if (record.stockValuationMethod) form.stockValuationMethod = record.stockValuationMethod;
  
  // GST fields with date formatting
  if (record.gstNo) form.gstNo = record.gstNo;
  if (record.gstStartDate) form.gstStartDate = formatDateForInput(record.gstStartDate);
  if (record.gstEndDate) form.gstEndDate = formatDateForInput(record.gstEndDate);
  if (record.vatRegNo) form.vatRegNo = record.vatRegNo;
  if (record.centralSalesTaxNo) form.centralSalesTaxNo = record.centralSalesTaxNo;
  if (record.serviceTaxRegNo) form.serviceTaxRegNo = record.serviceTaxRegNo;
  if (record.otherRegistration) form.otherRegistration = record.otherRegistration;
  
  // LLP fields
  if (record.isLLP !== undefined) form.isLLP = record.isLLP ? "YES" : "NO";
  if (record.llpId) form.llpId = record.llpId;
  
  // Individual specific fields with date formatting
  if (record.firstName) form.firstName = record.firstName;
  if (record.middleName) form.middleName = record.middleName;
  if (record.lastName) form.lastName = record.lastName;
  if (record.spouseName) form.spouseName = record.spouseName;
  if (record.qualification) form.qualification = record.qualification;
  if (record.nationality) form.nationality = record.nationality;
  if (record.occupation) form.occupation = record.occupation;
  if (record.uinNo) form.uinNo = record.uinNo;
  if (record.nameAsPerUIN) form.nameAsPerUIN = record.nameAsPerUIN;
  if (record.mobileLinkedWithUIN) form.mobileLinkedWithUIN = record.mobileLinkedWithUIN;
  if (record.passportStatus) form.passportStatus = record.passportStatus;
  if (record.passportNumber) form.passportNumber = record.passportNumber;
  if (record.gender) form.gender = record.gender;
  if (record.votersId) form.votersId = record.votersId;
  if (record.dob) form.dob = formatDateForInput(record.dob);
  if (record.dod) form.dod = formatDateForInput(record.dod);
  if (record.din) form.din = record.din;
  
  // Company specific fields with date formatting
  if (record.oldCompanyName) form.oldCompanyName = record.oldCompanyName;
  if (record.dateOfIncorporation) form.dateOfIncorporation = formatDateForInput(record.dateOfIncorporation);
  if (record.registrarOfCompanyId) form.registrarOfCompanyId = record.registrarOfCompanyId;
  if (record.cin) form.cin = record.cin;
  if (record.gln) form.gln = record.gln;
  if (record.companyCategory) form.companyCategory = record.companyCategory;
  if (record.companySub) form.companySub = record.companySub;
  if (record.companyCategoryOtherSpecify) form.companyCategoryOtherSpecify = record.companyCategoryOtherSpecify;
  if (record.sec8LicenceNo) form.sec8LicenceNo = record.sec8LicenceNo;
  if (record.companyType) form.companyType = record.companyType;
  if (record.havingShareCapital !== undefined) form.havingShareCapital = record.havingShareCapital ? "YES" : "NO";
  if (record.isPrivateOnePersonCompany !== undefined) form.isPrivateOnePersonCompany = record.isPrivateOnePersonCompany ? "YES" : "NO";
  
  // Signing person fields with date formatting
  if (record.signingPerson) {
    form.signingPersonName = record.signingPerson.name;
    form.signingPersonFatherName = record.signingPerson.fatherName || "";
    form.signingPersonDesignation = record.signingPerson.designation || "";
    form.signingPersonGender = record.signingPerson.gender || "";
    form.signingPersonPanNo = record.signingPerson.panNo || "";
    form.signingPersonDob = formatDateForInput(record.signingPerson.dob);
  }
  
  return form;
}

export default function ModifyModal({ record, onSave, onClose, saving }) {
  const [form, setForm] = useState(() => recordToForm(record));
  const [errors, setErrors] = useState({});

  // Update form when record changes (in case modal is reused)
  useEffect(() => {
    setForm(recordToForm(record));
    setErrors({});
  }, [record]);

  function setField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  const ExtraFields = EXTRA_FIELDS[form.status] ?? null;

  async function handleSave() {
    console.log("MODIFY FORM DATA =>", form);
    console.log("MODIFY PAYLOAD =>", buildClientPayload(form));
    
    const errs = validate(form);
    
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    
   await onSave(record.id, buildClientPayload(form));
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ 
        width: 720, 
        maxHeight: "90vh", 
        display: "flex", 
        flexDirection: "column" 
      }}>
        <ModalHeader 
          title={`Modify Record - ${record.codeNo}`} 
          subtitle={`Editing ${record.name}`}
          onClose={onClose} 
        />
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "0 20px",
          padding: "16px 20px 8px", 
          overflowY: "auto" 
        }}>
          <CommonFields form={form} set={setField} errors={errors} />
          
          {ExtraFields && <ExtraFields form={form} set={setField} errors={errors} />}
          
          <FormField label="Address" id="address">
            <textarea 
              id="address" 
              value={form.address} 
              onChange={setField("address")} 
              rows={2}
              style={{ 
                width: "100%", 
                boxSizing: "border-box", 
                padding: "6px 10px",
                fontSize: 13, 
                border: "1px solid #d1d5db", 
                borderRadius: 5,
                resize: "vertical", 
                fontFamily: "inherit" 
              }} 
            />
          </FormField>
        </div>
        
        <div style={{ 
          borderTop: "1px solid #e5e7eb", 
          padding: "12px 20px",
          display: "flex", 
          justifyContent: "flex-end", 
          gap: 8, 
          background: "#f9fafb" 
        }}>
          <ActionBtn variant="ghost" onClick={onClose}>
            Cancel
          </ActionBtn>
          <ActionBtn disabled={saving} onClick={handleSave}>
            {saving ? "Updating..." : "Update Record"}
          </ActionBtn>
        </div>
      </div>
    </Overlay>
  );
}