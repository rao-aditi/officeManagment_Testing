import FormField from "@/gst_Frontend/components/shared/FormField";
import Input from "@/gst_Frontend/components/shared/Input";

const selectStyle = {
  width: "100%",
  padding: "6px 10px",
  fontSize: 13,
  border: "1px solid #d1d5db",
  borderRadius: 5,
  background: "#fff",
};

function SelectField({
  label,
  id,
  value,
  onChange,
  options,
  error,
  required,
}) {
  return (
    <FormField
      label={label}
      id={id}
      error={error}
      required={required}
    >
      <select
        id={id}
        value={value}
        onChange={onChange}
        style={selectStyle}
      >
        <option value="">Select</option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

function SectionTitle({ children }) {
  return (
    <div
      style={{
        gridColumn: "1 / -1",
        margin: "6px 0 4px",
        padding: "6px 8px",
        background: "#e8f3fb",
        borderLeft: "4px solid #0284c7",
        color: "#0f3f5f",
        fontWeight: 700,
        fontSize: 12,
      }}
    >
      {children}
    </div>
  );
}

const yesNoOptions = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
];

export default function CompanyPublicNotInterestedFields({
  form,
  set,
  errors,
}) {
  return (
    <>
      <SectionTitle>
        Personal Information
      </SectionTitle>

      <FormField label="Group" id="group">
        <Input
          id="group"
          value={form.group}
          onChange={set("group")}
        />
      </FormField>

  

   

      <SelectField
        label="Residential Status"
        id="residentialStatus"
        value={form.residentialStatus}
        onChange={set("residentialStatus")}
        options={[
          {
            value: "RESIDENT",
            label: "Resident",
          },
          {
            value: "NON_RESIDENT",
            label: "Non Resident",
          },
          {
            value:
              "NOT_ORDINARILY_RESIDENT",
            label:
              "Not Ordinarily Resident",
          },
        ]}
      />

      <FormField label="TAN" id="tan">
        <Input
          id="tan"
          value={form.tan}
          onChange={set("tan")}
        />
      </FormField>

      <FormField
        label="Date Of Commencement"
        id="dateOfCommencementOfBusiness"
      >
        <Input
          id="dateOfCommencementOfBusiness"
          value={
            form.dateOfCommencementOfBusiness
          }
          onChange={set(
            "dateOfCommencementOfBusiness"
          )}
          placeholder="YYYY-MM-DD"
        />
      </FormField>

      <SelectField
        label="FII / FPI"
        id="isFIIFPI"
        value={form.isFIIFPI}
        onChange={set("isFIIFPI")}
        options={yesNoOptions}
      />

      <FormField
        label="SEBI Regn No"
        id="sebiRegnNo"
      >
        <Input
          id="sebiRegnNo"
          value={form.sebiRegnNo}
          onChange={set("sebiRegnNo")}
        />
      </FormField>

      <SectionTitle>
        MSME Information
      </SectionTitle>

      <SelectField
        label="MSME"
        id="isMSME"
        value={form.isMSME}
        onChange={set("isMSME")}
        options={yesNoOptions}
      />

      <FormField
        label="MSME Registration No"
        id="msmeRegistrationNo"
      >
        <Input
          id="msmeRegistrationNo"
          value={form.msmeRegistrationNo}
          onChange={set(
            "msmeRegistrationNo"
          )}
        />
      </FormField>

      <FormField
        label="MSME Registration Date"
        id="msmeRegistrationDate"
      >
        <Input
          id="msmeRegistrationDate"
          value={
            form.msmeRegistrationDate
          }
          onChange={set(
            "msmeRegistrationDate"
          )}
          placeholder="YYYY-MM-DD"
        />
      </FormField>

      <SelectField
        label="Enterprise Type"
        id="enterpriseType"
        value={form.enterpriseType}
        onChange={set("enterpriseType")}
        options={[
          {
            value: "MICRO",
            label: "Micro",
          },
          {
            value: "SMALL",
            label: "Small",
          },
          {
            value: "MEDIUM",
            label: "Medium",
          },
        ]}
      />

      <SelectField
        label="Major Activity"
        id="majorActivity"
        value={form.majorActivity}
        onChange={set("majorActivity")}
        options={[
          {
            value: "MANUFACTURING",
            label: "Manufacturing",
          },
          {
            value: "SERVICES",
            label: "Services",
          },
          {
            value: "TRADING",
            label: "Trading",
          },
        ]}
      />

      <SectionTitle>
        Business Information
      </SectionTitle>


      <FormField
        label="Contact Person"
        id="contactPerson"
      >
        <Input
          id="contactPerson"
          value={form.contactPerson}
          onChange={set("contactPerson")}
        />
      </FormField>

      <SelectField
        label="Nature Of Business"
        id="natureOfBusiness"
        value={form.natureOfBusiness}
        onChange={set("natureOfBusiness")}
        options={[
          { value: "EXPORT", label: "Export" },
          {
            value: "MANUFACTURING",
            label: "Manufacturing",
          },
          {
            value:
              "MANUFACTURING_AND_TRADING",
            label:
              "Manufacturing And Trading",
          },
          {
            value: "RETAIL_TRADING",
            label: "Retail Trading",
          },
          {
            value: "WHOLESALE_BUSINESS",
            label:
              "Wholesale Business",
          },
          {
            value:
              "WHOLESALE_CUM_RETAIL",
            label:
              "Wholesale Cum Retail",
          },
          {
            value:
              "CONSTRUCTION_BUSINESS",
            label:
              "Construction Business",
          },
          {
            value:
              "SERVICE_PROVIDER",
            label: "Service Provider",
          },
          {
            value:
              "FINANCING_SERVICES",
            label:
              "Financing Services",
          },
          {
            value:
              "SHARES_AND_BROKERAGE",
            label:
              "Shares And Brokerage",
          },
          { value: "IMPORT", label: "Import" },
          { value: "LESSOR", label: "Lessor" },
          { value: "LESSEE", label: "Lessee" },
          {
            value: "WORK_CONTRACTOR",
            label:
              "Work Contractor",
          },
        ]}
      />

      <SelectField
        label="Stock Valuation Method"
        id="stockValuationMethod"
        value={form.stockValuationMethod}
        onChange={set(
          "stockValuationMethod"
        )}
        options={[
          {
            value: "COST_PRICE",
            label: "Cost Price",
          },
          {
            value: "MARKET_PRICE",
            label: "Market Price",
          },
          {
            value:
              "AVERAGE_COST_METHOD",
            label:
              "Average Cost Method",
          },
          {
            value:
              "COST_OR_MARKET_WHICHEVER_LESS",
            label:
              "Cost Or Market Whichever Less",
          },
          {
            value: "FIFO",
            label: "FIFO",
          },
          {
            value: "LIFO",
            label: "LIFO",
          },
        ]}
      />

      <SectionTitle>
        GST & Registrations
      </SectionTitle>

      <FormField label="GST No" id="gstNo">
        <Input
          id="gstNo"
          value={form.gstNo}
          onChange={set("gstNo")}
        />
      </FormField>

      <FormField
        label="GST Start Date"
        id="gstStartDate"
      >
        <Input
          id="gstStartDate"
          value={form.gstStartDate}
          onChange={set("gstStartDate")}
          placeholder="YYYY-MM-DD"
        />
      </FormField>

      <FormField
        label="GST End Date"
        id="gstEndDate"
      >
        <Input
          id="gstEndDate"
          value={form.gstEndDate}
          onChange={set("gstEndDate")}
          placeholder="YYYY-MM-DD"
        />
      </FormField>

      <FormField
        label="VAT Reg No"
        id="vatRegNo"
      >
        <Input
          id="vatRegNo"
          value={form.vatRegNo}
          onChange={set("vatRegNo")}
        />
      </FormField>

      <FormField
        label="Central Sales Tax No"
        id="centralSalesTaxNo"
      >
        <Input
          id="centralSalesTaxNo"
          value={form.centralSalesTaxNo}
          onChange={set(
            "centralSalesTaxNo"
          )}
        />
      </FormField>

      <FormField
        label="Service Tax Reg No"
        id="serviceTaxRegNo"
      >
        <Input
          id="serviceTaxRegNo"
          value={form.serviceTaxRegNo}
          onChange={set(
            "serviceTaxRegNo"
          )}
        />
      </FormField>

      <FormField
        label="Other Registration"
        id="otherRegistration"
      >
        <Input
          id="otherRegistration"
          value={form.otherRegistration}
          onChange={set(
            "otherRegistration"
          )}
        />
      </FormField>

      <SectionTitle>
        LLP Information
      </SectionTitle>

      <SelectField
        label="Is LLP"
        id="isLLP"
        value={form.isLLP}
        onChange={set("isLLP")}
        options={yesNoOptions}
      />

      <FormField label="LLP ID" id="llpId">
        <Input
          id="llpId"
          value={form.llpId}
          onChange={set("llpId")}
        />
      </FormField>

    

<SectionTitle>
  ROC Information
</SectionTitle>

<FormField
  label="Old Company Name"
  id="oldCompanyName"
>
  <Input
    id="oldCompanyName"
    value={form.oldCompanyName}
    onChange={set("oldCompanyName")}
  />
</FormField>

<FormField
  label="Date Of Incorporation"
  id="dateOfIncorporation"
>
  <Input
    id="dateOfIncorporation"
    type="date"
    value={form.dateOfIncorporation}
    onChange={set("dateOfIncorporation")}
  />
</FormField>

<SelectField
  label="Registrar Of Company"
  id="registrarOfCompanyId"
  value={form.registrarOfCompanyId}
  onChange={set("registrarOfCompanyId")}
  options={[
    { value: 1, label: "Andhra Pradesh" },
    { value: 2, label: "Arunachal Pradesh" },
    { value: 3, label: "Assam" },
    { value: 4, label: "Bihar" },
    { value: 5, label: "Chandigarh" },
    { value: 6, label: "Chattisgarh" },
    { value: 7, label: "Dadra & Nagar Haveli" },
    { value: 8, label: "Daman & Diu" },
    { value: 9, label: "Delhi" },
    { value: 10, label: "Goa" },
    { value: 11, label: "Gujarat" },
    { value: 12, label: "Haryana" },
    { value: 13, label: "Himachal Pradesh" },
    { value: 14, label: "Jammu" },
    { value: 15, label: "Kashmir" },
    { value: 16, label: "Ladakh" },
    { value: 17, label: "Jharkhand" },
    { value: 18, label: "Karnataka" },
    { value: 19, label: "Kerala" },
    { value: 20, label: "Lakshadweep" },
    { value: 21, label: "Madhya Pradesh" },
    { value: 22, label: "Maharashtra (Mumbai)" },
    { value: 23, label: "Maharashtra (Pune)" },
    { value: 24, label: "Manipur" },
    { value: 25, label: "Meghalaya" },
    { value: 26, label: "Mizoram" },
    { value: 27, label: "N/A" },
    { value: 28, label: "Nagaland" },
    { value: 29, label: "Orissa" },
    { value: 30, label: "Pondicherry" },
    { value: 31, label: "Punjab" },
    { value: 32, label: "Rajasthan" },
    { value: 33, label: "Sikkim" },
    { value: 34, label: "Tamil Nadu" },
    { value: 35, label: "Telangana" },
    { value: 36, label: "Tripura" },
    { value: 37, label: "Uttar Pradesh" },
    { value: 38, label: "Uttaranchal" },
    { value: 39, label: "West Bengal" },
  ]}
/>

<FormField label="CIN" id="cin">
  <Input
    id="cin"
    value={form.cin}
    onChange={set("cin")}
  />
</FormField>

<FormField label="GLN" id="gln">
  <Input
    id="gln"
    value={form.gln}
    onChange={set("gln")}
  />
</FormField>

<SelectField
  label="Company Category"
  id="companyCategory"
  value={form.companyCategory}
  onChange={set("companyCategory")}
  options={[
    {
      value: "LIMITED_BY_SHARES",
      label: "Limited By Shares",
    },
    {
      value: "LIMITED_BY_MEMBERS",
      label: "Limited By Members",
    },
    {
      value: "LIMITED_BY_GUARANTOR",
      label: "Limited By Guarantor",
    },
    {
      value: "UNLIMITED_COMPANY",
      label: "Unlimited Company",
    },
  ]}
/>

<SelectField
  label="Company Sub"
  id="companySub"
  value={form.companySub}
  onChange={set("companySub")}
  options={[
    {
      value: "UNION_GOVERNMENT_COMPANY",
      label: "Union Government Company",
    },
    {
      value: "STATE_GOVERNMENT_COMPANY",
      label: "State Government Company",
    },
    {
      value:
        "INDIAN_NON_GOVERNMENT_COMPANY",
      label:
        "Indian Non-Government Company",
    },
    {
      value:
        "SUBSIDIARY_OF_FOREIGN_COMPANY",
      label:
        "Subsidiary Of Foreign Company",
    },
    {
      value:
        "COMPANY_LICENSED_UNDER_SECTION_25",
      label:
        "Company Licensed Under Section 25",
    },
    {
      value:
        "GUARANTEE_AND_ASSOCIATION_COMPANY",
      label:
        "Guarantee And Association Company",
    },
    {
      value: "OTHERS",
      label: "Others",
    },
  ]}
/>

<FormField
  label="If Other Specify"
  id="companyCategoryOtherSpecify"
>
  <Input
    id="companyCategoryOtherSpecify"
    value={
      form.companyCategoryOtherSpecify
    }
    onChange={set(
      "companyCategoryOtherSpecify"
    )}
  />
</FormField>

<FormField
  label="Sec 8 Licence No"
  id="sec8LicenceNo"
>
  <Input
    id="sec8LicenceNo"
    value={form.sec8LicenceNo}
    onChange={set("sec8LicenceNo")}
  />
</FormField>

<SelectField
  label="Company Type"
  id="companyType"
  value={form.companyType}
  onChange={set("companyType")}
  options={[
    {
      value: "NEW",
      label: "New",
    },
    {
      value: "PRODUCER",
      label: "Producer",
    },
    {
      value: "SECTION_8_COMPANY",
      label: "Section 8 Company",
    },
    {
      value:
        "PART_I_COMPANY_CHAPTER_XXI",
      label:
        "Part I Company (Chapter XXI)",
    },
  ]}
/>

<SelectField
  label="Having Share Capital"
  id="havingShareCapital"
  value={String(
    form.havingShareCapital ?? ""
  )}
  onChange={(e) =>
    setForm((prev) => ({
      ...prev,
      havingShareCapital:
        e.target.value === "true",
    }))
  }
  options={[
    {
      value: "true",
      label: "Yes",
    },
    {
      value: "false",
      label: "No",
    },
  ]}
/>


<SelectField
  label="Private One Person Company"
  id="isPrivateOnePersonCompany"
  value={form.isPrivateOnePersonCompany}
  onChange={set("isPrivateOnePersonCompany")}
  options={yesNoOptions}
/>

      <SectionTitle>
        Signing Person Information
      </SectionTitle>

      <FormField
        label="Signing Person Name"
        id="signingPersonName"
      >
        <Input
          id="signingPersonName"
          value={form.signingPersonName}
          onChange={set(
            "signingPersonName"
          )}
        />
      </FormField>

      <FormField
        label="Father Name"
        id="signingPersonFatherName"
      >
        <Input
          id="signingPersonFatherName"
          value={
            form.signingPersonFatherName
          }
          onChange={set(
            "signingPersonFatherName"
          )}
        />
      </FormField>

      <FormField
        label="Designation"
        id="signingPersonDesignation"
      >
        <Input
          id="signingPersonDesignation"
          value={
            form.signingPersonDesignation
          }
          onChange={set(
            "signingPersonDesignation"
          )}
        />
      </FormField>

      <SelectField
        label="Gender"
        id="signingPersonGender"
        value={form.signingPersonGender}
        onChange={set(
          "signingPersonGender"
        )}
        options={[
          {
            value: "MALE",
            label: "Male",
          },
          {
            value: "FEMALE",
            label: "Female",
          },
          {
            value: "OTHER",
            label: "Other",
          },
        ]}
      />

      <FormField
        label="PAN No"
        id="signingPersonPanNo"
      >
        <Input
          id="signingPersonPanNo"
          value={form.signingPersonPanNo}
          onChange={set(
            "signingPersonPanNo"
          )}
        />
      </FormField>

      <FormField
        label="DOB"
        id="signingPersonDob"
      >
        <Input
          id="signingPersonDob"
          value={form.signingPersonDob}
          onChange={set(
            "signingPersonDob"
          )}
          placeholder="YYYY-MM-DD"
        />
      </FormField>
    </>
  );
}