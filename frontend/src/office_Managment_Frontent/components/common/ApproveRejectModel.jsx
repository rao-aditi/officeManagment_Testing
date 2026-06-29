import React from "react";
import Button from "../ui/Button";

const ApproveRejectModel = ({
  isOpen,
  type = "approve",
  title,
  description,
  confirmButtonText,
  remarks,
  setRemarks,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen) return null;

  const isReject = type === "reject";
  
  const modalTitle = title || (isReject ? "Reject Task" : "Approve Task");
  const modalDescription = description || (isReject
    ? "Please provide remarks for rejecting this task."
    : "Add remarks before approving this task (optional).");
  const confirmText = confirmButtonText || (isReject ? "Reject Task" : "Approve Task");
  const placeholderText = isReject
    ? "Enter rejection remarks..."
    : "Enter approval remarks...";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b border-gray-300 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {modalTitle}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {modalDescription}
          </p>
        </div>

        <div className="p-6">
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={placeholderText}
            rows={4}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-300 px-6 py-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={isReject ? "danger" : "success"}
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApproveRejectModel;