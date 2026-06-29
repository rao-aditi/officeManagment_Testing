import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import SelectInput from "../../components/ui/SelectInput";
import { Save, X } from "lucide-react";
import { getEnums } from "../../store/slice/auth/authSlice";

const AddEditDocumentTypeModal = ({
  isOpen,
  onClose,
  mode,
  formik,
  loading,
  statusOptions,
  frequencyOptions
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "Edit Document Type" : "Add Document Type"}
      size="lg"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextInput
            label="Document Type Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. GST Return"
            error={formik.errors.name}
            touched={formik.touched.name}
          />
          <SelectInput
            label="Status"
            name="status"
            value={formik.values.status}
            options={statusOptions.filter((opt) => opt.value !== "ALL")}
            onChange={(val) => formik.setFieldValue("status", val)}
            error={formik.errors.status}
          />
        </div>

        <SelectInput
          label="Frequency Types"
          name="frequencyTypes"
          value={formik.values.frequencyTypes || []}
          options={frequencyOptions}
          onChange={(val) => {
            formik.setFieldValue("frequencyTypes", val);
            formik.setFieldTouched("frequencyTypes", true);
          }}
          placeholder="Select frequency types"
          isMulti={true}
          searchable={true}
          required
          error={
            formik.touched.frequencyTypes && formik.errors.frequencyTypes
              ? formik.errors.frequencyTypes
              : null
          }
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            <X size={14} className="mr-1" /> Cancel
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            <Save size={14} className="mr-1" />
            {loading ? "Saving..." : mode === "edit" ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditDocumentTypeModal;
