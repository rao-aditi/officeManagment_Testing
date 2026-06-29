import React from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

const StatusChangeModel = ({
  isOpen,
  onClose,
  statusItem,
  loading,
  dispatch,
  showAlert,
  fetchServiceTypes,
  updateServiceType,
}) => {
  const nextStatus =
    statusItem?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  const handleUpdateStatus = async () => {
    if (!statusItem) return;

    try {
      await dispatch(
        updateServiceType({
          id: statusItem.id,
          data: {
            status: nextStatus,
          },
        })
      ).unwrap();

      showAlert({
        type: "success",
        title: "Status Updated",
        message: `Service status changed to ${nextStatus}.`,
      });

      dispatch(fetchServiceTypes());
      onClose();
    } catch (err) {
      showAlert({
        type: "error",
        title: "Error",
        message: err || "Failed to update status.",
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Status"
      size="sm"
    >
      {statusItem && (
        <div className="space-y-4">
          <div>
            <p className="text-base font-medium text-gray-800">
              {statusItem.status === "ACTIVE"
                ? "Mark as Inactive"
                : "Mark as Active"}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Are you sure you want to change the status to {" "}
              <span
                className={`font-semibold ${
                  nextStatus === "ACTIVE"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {nextStatus}
              </span>
             {" "} ?
            </p>
          </div>

          <div className="flex justify-end gap-2 py-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              onClick={handleUpdateStatus}
              disabled={loading}
              variant={
                nextStatus === "ACTIVE"
                  ? "success-outline"
                  : "danger-outline"
              }
            >
              {loading ? "Updating..." : `${nextStatus}`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default StatusChangeModel;