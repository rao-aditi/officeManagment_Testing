import React from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import SelectInput from "../../components/ui/SelectInput";
import { Save, X } from "lucide-react";
import ToggleButton from "../../components/ui/ToggleButton";

const AddEditServiceFeeModel = ({
  isOpen,
  onClose,
  mode,
  formik,
  loading,
  STATUS_OPTIONS,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "Edit Service Type" : "Add Service Type"}
      size="lg"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className=" grid grid-cols-2 gap-3">
          <TextInput
            label="Service Name"
            name="serviceTypeName"
            value={formik.values.serviceTypeName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. GST Return Filing"
            error={formik.errors.serviceTypeName}
            touched={formik.touched.serviceTypeName}
          />
          <TextInput
            label="Base Amount (₹)"
            name="baseAmount"
            type="number"
            min="0"
            step="0.01"
            value={formik.values.baseAmount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. 5000"
            error={formik.errors.baseAmount}
            touched={formik.touched.baseAmount}
          />
          <TextInput
            label="Tax Rate (%)"
            name="taxRate"
            type="number"
            min="0"
            step="0.01"
            value={formik.values.taxRate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. 18"
            error={formik.errors.taxRate}
            touched={formik.touched.taxRate}
          />
          <SelectInput
            label="Status"
            name="status"
            value={formik.values.status}
            options={STATUS_OPTIONS}
            onChange={(val) => formik.setFieldValue("status", val)}
            error={formik.errors.status}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-800">Discount Allowed</p>
            <p className="text-xs text-gray-500">
              Enable to allow coupon-based discounts on this service.
            </p>
          </div>
          <ToggleButton
            checked={formik.values.discountAllowed}
            onChange={(e) => {
              const checked = e.target.checked;
              formik.setFieldValue("discountAllowed", checked);
              if (!checked) {
                formik.setFieldValue("couponCode", "");
              }
            }}
            disabled={loading}
            size="md"
          />
        </div>

        {formik.values.discountAllowed && (
          <TextInput
            label="Coupon Code"
            name="couponCode"
            value={formik.values.couponCode}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. GST10OFF"
            error={formik.errors.couponCode}
            touched={formik.touched.couponCode}
          />
        )}

        <div className="flex justify-end py-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              leftIcon={X}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" leftIcon={Save} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditServiceFeeModel;