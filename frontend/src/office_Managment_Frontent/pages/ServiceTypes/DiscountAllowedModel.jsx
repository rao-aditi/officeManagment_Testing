import React from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import ToggleButton from "../../components/ui/ToggleButton";

const DiscountAllowedModel = ({
  isOpen,
  onClose,
  discountItem,
  setDiscountItem,
  loading,
  dispatch,
  showAlert,
  fetchServiceTypes,
  updateServiceType,
}) => {
  const handleUpdateDiscount = async () => {
    if (!discountItem) return;

    try {
      await dispatch(
        updateServiceType({
          id: discountItem.id,
          data: {
            ...discountItem,
            couponCode: discountItem.discountAllowed
              ? discountItem.couponCode
              : null,
          },
        })
      ).unwrap();

      showAlert({
        type: "success",
        title: "Updated",
        message: "Discount updated successfully",
      });

      dispatch(fetchServiceTypes());
      onClose();
    } catch (err) {
      showAlert({
        type: "error",
        title: "Error",
        message: err || "Update failed",
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Discount"
      size="sm"
    >
      {discountItem && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Discount Allowed</p>
            <ToggleButton
              checked={discountItem.discountAllowed}
              onChange={(e) =>
                setDiscountItem({
                  ...discountItem,
                  discountAllowed: e.target.checked,
                  couponCode: e.target.checked ? discountItem.couponCode : "",
                })
              }
              size="md"
            />
          </div>

          {/* Coupon Code */}
          {discountItem.discountAllowed && (
            <TextInput
              label="Coupon Code"
              value={discountItem.couponCode || ""}
              onChange={(e) =>
                setDiscountItem({
                  ...discountItem,
                  couponCode: e.target.value,
                })
              }
              placeholder="Enter coupon code"
            />
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              onClick={handleUpdateDiscount}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DiscountAllowedModel;