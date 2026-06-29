import FormField from "@/gst_Frontend/components/shared/FormField";
import Input from "@/gst_Frontend/components/shared/Input";

export default function CommonFields({ form, set, errors }) {
  return (
    <>
      <FormField label="Code No" id="code" error={errors.code} required>
        <Input id="code" value={form.code} onChange={set("code")} placeholder="e.g. 247" />
      </FormField>
      <FormField label="Prefix" id="prefix">
        <Input id="prefix" value={form.prefix} onChange={set("prefix")} placeholder="M/s, Shri, Smt, Dr"/>
      </FormField>

      <FormField label="PAN" id="pan" error={errors.pan} required>
        <Input id="pan" value={form.pan} onChange={set("pan")} placeholder="ABCDE1234F"
          style={{ textTransform: "uppercase" }} />
      </FormField>
      <FormField label="Name" id="name" error={errors.name} required>
        <Input id="name" value={form.name} onChange={set("name")} placeholder="Full name" />
      </FormField>
      <FormField label="Ward / Circle" id="ward">
        <Input id="ward" value={form.ward} onChange={set("ward")} placeholder="e.g. Ward-3" />
      </FormField>
      <FormField label="Mobile" id="mobile">
        <Input id="mobile" value={form.mobile} onChange={set("mobile")} placeholder="10-digit" />
      </FormField>
      <FormField label="Email" id="email">
        <Input id="email" value={form.email} onChange={set("email")} placeholder="email@example.com" />
      </FormField>
    </>
  );
}
