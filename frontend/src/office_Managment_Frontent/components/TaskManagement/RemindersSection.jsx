import React, { useState } from "react";
import { useDispatch } from "react-redux";
import Card, { CardBody } from "../ui/Card";
import Button from "../ui/Button";
import { Bell } from "lucide-react";
import { formatDateTime, toIsoDateTime } from "../../helpers/commonFunctions";
import { createReminder, cancelReminder } from "../../store/slice/dueDate/dueDateSlice";
import { useAlert } from "../../helpers/AlertContent";
import ApproveRejectModel from "../common/ApproveRejectModel";

// Import the REMINDER_STATUS constant
const REMINDER_STATUS = Object.freeze({
  PENDING: "PENDING",
  SENT: "SENT",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
});

// Helper function to get reminder status badge styling
const getReminderStatusBadge = (status) => {
  const statusMap = {
    [REMINDER_STATUS.PENDING]: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      label: "Pending"
    },
    [REMINDER_STATUS.SENT]: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Sent"
    },
    [REMINDER_STATUS.FAILED]: {
      bg: "bg-red-100",
      text: "text-red-800",
      label: "Failed"
    },
    [REMINDER_STATUS.CANCELLED]: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      label: "Cancelled"
    }
  };

  const config = statusMap[status] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
    label: status
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

const RemindersSection = ({ taskId, reminders, taskStatus, onRefresh }) => {
  const dispatch = useDispatch();
  const { showAlert } = useAlert();

  const [reminderAt, setReminderAt] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");
  const [selectedReminderId, setSelectedReminderId] = useState(null);
  const [showCancelReminderModal, setShowCancelReminderModal] = useState(false);
  const [cancelReminderRemarks, setCancelReminderRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateReminder = async () => {
    if (!reminderAt) return;
    setLoading(true);
    try {
      await dispatch(
        createReminder({
          taskId,
          data: {
            remindAt: toIsoDateTime(reminderAt),
            message: reminderMessage.trim() || undefined,
          },
        })
      ).unwrap();
      setReminderAt("");
      setReminderMessage("");
      onRefresh();
      showAlert({ type: "success", title: "Reminder Set", message: "Reminder created." });
    } catch (error) {
      showAlert({ type: "error", title: "Error", message: error });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReminderClick = (reminderId) => {
    setSelectedReminderId(reminderId);
    setShowCancelReminderModal(true);
    setCancelReminderRemarks("");
  };

  const confirmCancelReminder = async () => {
    if (!selectedReminderId) return;
    setLoading(true);
    try {
      await dispatch(
        cancelReminder({
          reminderId: selectedReminderId,
          taskId,
        })
      ).unwrap();
      showAlert({
        type: "success",
        title: "Reminder Cancelled",
        message: "Reminder has been cancelled successfully.",
      });
      setShowCancelReminderModal(false);
      setSelectedReminderId(null);
      setCancelReminderRemarks("");
      onRefresh();
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error",
        message: error?.message || "Failed to cancel reminder.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if reminder can be cancelled (only PENDING and not already cancelled)
  const canCancelReminder = (reminder) => {
    return reminder.status === REMINDER_STATUS.PENDING &&
      reminder.reminderType === "CUSTOM";
  };

  // Check if new reminders can be added
  const canAddReminders = () => {
    return !["COMPLETED", "CANCELLED"].includes(taskStatus);
  };

  return (
    <>
      <Card className="mb-6">
        <CardBody className="p-6 space-y-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
            <Bell size={16} /> Reminders
          </h3>

          {canAddReminders() && (
            <div className="flex items-center gap-3 pt-2 pb-3 border-b border-gray-200">
              <input
                type="datetime-local"
                value={reminderAt}
                onChange={(e) => setReminderAt(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#04506B] focus:border-[#04506B]"
              />
              <input
                type="text"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                placeholder="Reminder message (optional)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#04506B] focus:border-[#04506B]"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateReminder}
                disabled={loading || !reminderAt}
                styleClass="!w-auto"
              >
                Add Reminder
              </Button>
            </div>
          )}

          {reminders.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No reminders set for this task.
            </p>
          ) : (
            reminders.map((r) => (
              <div
                key={r.id}
                className="flex justify-between items-start bg-gray-50 p-3 rounded-lg text-sm hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">
                      {formatDateTime(r.remindAt)}
                    </p>
                    {getReminderStatusBadge(r.status)}
                  </div>
                  {r.message && (
                    <p className="text-gray-600 text-sm mt-1">{r.message}</p>
                  )}
                  {r.reminderType === "CUSTOM" && (
                    <p className="text-xs text-gray-400 mt-1">
                      Type: {r.reminderType}
                    </p>
                  )}
                  {r.status === REMINDER_STATUS.FAILED && r.errorMessage && (
                    <p className="text-xs text-red-500 mt-1">
                      Error: {r.errorMessage}
                    </p>
                  )}
                </div>
                {canCancelReminder(r) && (
                  <Button
                    type="button"
                    onClick={() => handleCancelReminderClick(r.id)}
                    variant="danger-outline"
                    size="sm"
                    disabled={loading}
                    styleClass="!w-auto"
                  >
                    Cancel Reminder
                  </Button>
                )}
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <ApproveRejectModel
        isOpen={showCancelReminderModal}
        type="reject"
        remarks={cancelReminderRemarks}
        setRemarks={setCancelReminderRemarks}
        loading={loading}
        onClose={() => {
          setShowCancelReminderModal(false);
          setSelectedReminderId(null);
          setCancelReminderRemarks("");
        }}
        onConfirm={confirmCancelReminder}
      />
    </>
  );
};

export default RemindersSection;