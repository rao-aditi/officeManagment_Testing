import { useState } from "react";
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
import BodyofIndividualFields from "@/gst_Frontend/modules/master-data/form-sections/BodyOfIndividualFields"
import ArtificialJuridicalFields from "@/gst_Frontend/modules/master-data/form-sections/ArtificialJuridicalPersonFields"
import CooperativeSocietyFields from "@/gst_Frontend/modules/master-data/form-sections/CooperativeSocietyFields"
import CompanyPublicInterestedFields from "@/gst_Frontend/modules/master-data/form-sections/CompanyPublicInterestedFields";
import CompanyPublicNotInterestedFields from "@/gst_Frontend/modules/master-data/form-sections/CompanyPublicNotInterested";
import CompanyPrivateFields from "@/gst_Frontend/modules/master-data/form-sections/CompanyPrivate"
import LocalAuthorityFields from "@/gst_Frontend/modules/master-data/form-sections/LocalAuthorityFields"
// Status code → which extra component to render
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
  "13" : CompanyPublicNotInterestedFields,
  "14": CompanyPrivateFields,
  "16": LocalAuthorityFields,
  // baaki status ke liye null = sirf common fields
};

export default function AddFormModal({ statusCode, onSave, onBack, onClose, saving }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, status: statusCode });
  const [errors, setErrors] = useState({});

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  const ExtraFields = EXTRA_FIELDS[statusCode] ?? null;  // null = render nothing

function handleSave() {
  console.log("FORM DATA =>", form);
  console.log("PAYLOAD =>", buildClientPayload(form));

  const errs = validate(form);

  if (Object.keys(errs).length) {
    setErrors(errs);
    return;
  }

  onSave(buildClientPayload(form));
}
  return (
    <Overlay onClose={onClose}>
      <div style={{ width: 720, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <ModalHeader title="Add New Record" onClose={onClose} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px",
          padding: "16px 20px 8px", overflowY: "auto" }}>

          <CommonFields form={form} set={set} errors={errors} />

          {/* Agar us status ka component hai toh render karo, warna kuch nahi */}
          {ExtraFields && <ExtraFields form={form} set={set} errors={errors} />}

          <FormField label="Address" id="address">
            <textarea id="address" value={form.address} onChange={set("address")} rows={2}
              style={{ width: "100%", boxSizing: "border-box", padding: "6px 10px",
                fontSize: 13, border: "1px solid #d1d5db", borderRadius: 5,
                resize: "vertical", fontFamily: "inherit" }} />
          </FormField>
        </div>
        <div style={{ borderTop: "1px solid #e5e7eb", padding: "12px 20px",
          display: "flex", justifyContent: "space-between", gap: 8, background: "#f9fafb" }}>
          <ActionBtn variant="ghost" onClick={onBack}>Back</ActionBtn>
          <div style={{ display: "flex", gap: 8 }}>
            <ActionBtn variant="ghost" onClick={onClose}>Cancel</ActionBtn>
            <ActionBtn disabled={saving} onClick={handleSave}>
              {saving ? "Saving..." : "Save Record"}
            </ActionBtn>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
