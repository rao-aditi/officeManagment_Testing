import React from "react";
import Button from "../../components/ui/Button";
import { X } from "lucide-react";

const StatusConfirmModal = ({
  isOpen,
  user,
  action,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen) return null;

  const isActivate = action === "activate";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
        <div className="border-b border-gray-200 px-6 py-6 flex items-start justify-between">
          <div>
            <h2
              className="text-xl font-bold text-gray-900"
            >
              {isActivate
                ? "Activate User"
                : "Deactivate User"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {isActivate
                ? "Are you sure you want to activate this user?"
                : "Are you sure you want to deactivate this user?"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-700">
            User:{" "}
            <span className="font-semibold">
              {user?.name}
            </span>
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            variant={isActivate ? "success" : "danger"}
            onClick={onConfirm}
            disabled={loading}
          >
            {isActivate
              ? "Activate User"
              : "Deactivate User"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatusConfirmModal;