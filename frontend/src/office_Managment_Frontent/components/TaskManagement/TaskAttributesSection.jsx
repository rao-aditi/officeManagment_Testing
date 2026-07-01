import React, { useState } from "react";
import Card, { CardBody } from "../ui/Card";
import Button from "../ui/Button";
import { Clock, User, Building } from "lucide-react";
import {
  formatDateTime,
  getClientDisplayName,
  getUserId,
  toIsoDateTime,
  toLocalDateTimeInput,
} from "../../helpers/commonFunctions";
import { usePermission } from "../../Hooks/usePermission";
import ApproveRejectModel from "../common/ApproveRejectModel";

const TaskAttributesSection = ({
  task,
  dueDateHistory,
  onDueDateChange,
  onStatusChange,
  loading,
  dueDateLoading,
}) => {
  const { can, canAny } = usePermission();
  const [dueDateInput, setDueDateInput] = useState("");
  const [dueDateReason, setDueDateReason] = useState("");
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [actionRemarks, setActionRemarks] = useState("");

  React.useEffect(() => {
    if (task?.dueDate) {
      setDueDateInput(toLocalDateTimeInput(task.dueDate));
    }
  }, [task?.dueDate]);

  const handleDueDateChange = () => {
    if (!dueDateInput) return;
    onDueDateChange(dueDateInput, dueDateReason);
    setDueDateReason("");
  };

  const handleStatusAction = (type) => {
    setActionType(type);
    setShowActionModal(true);
  };

  const confirmStatusChange = () => {
    if (actionType === "reject" && !actionRemarks.trim()) {
      // Validation handled by parent
      onStatusChange(actionType === "approve" ? "APPROVED" : "REJECTED", actionRemarks);
    } else {
      onStatusChange(actionType === "approve" ? "APPROVED" : "REJECTED", actionRemarks);
    }
    setShowActionModal(false);
    setActionRemarks("");
  };

  const currentUserId = getUserId();
  const isAssignee = task?.assignedToId === currentUserId;
  const showAssigneeActions =
    isAssignee &&
    ["ASSIGNED", "IN_PROGRESS", "REJECTED", "OVERDUE"].includes(task?.status);
  const showApproverActions = canAny([
    "approve_task",
    "approve_task_if_enabled",
  ]);
  const canChangeDue =
    canAny([
      "change_due_date",
      "request_due_date_change",
    ]) || isAssignee;

  return (
    <>
      <Card>
        <CardBody className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Task Attributes
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <Building size={16} className="text-gray-400" />
              <div>
                <span className="text-gray-500 block">Client</span>
                <span className="font-semibold text-gray-800">
                  {getClientDisplayName(task.client)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User size={16} className="text-gray-400" />
              <div>
                <span className="text-gray-500 block">Assigned Staff</span>
                <span className="font-semibold text-gray-800">
                  {task.assignedTo?.name || "Unassigned"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock size={16} className="text-gray-400" />
              <div>
                <span className="text-gray-500 block">Due Date</span>
                <span className="font-semibold text-gray-800">
                  {task.dueDate ? formatDateTime(task.dueDate) : "—"}
                </span>
              </div>
            </div>
          </div>

          {canChangeDue &&
            !["COMPLETED", "CANCELLED"].includes(task.status) &&
            canAny(["request_due_date_change"]) && (
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <span className="text-sm font-bold text-gray-500 uppercase block">
                  Adjust Due Date
                </span>

                <input
                  type="datetime-local"
                  value={dueDateInput}
                  onChange={(e) => setDueDateInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />

                <input
                  type="text"
                  value={dueDateReason}
                  onChange={(e) => setDueDateReason(e.target.value)}
                  placeholder="Reason (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />

                <Button
                  size="sm"
                  onClick={handleDueDateChange}
                  loading={dueDateLoading}
                  styleClass="!w-auto"
                >
                  Update Due Date
                </Button>
              </div>
            )}

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <span className="text-sm font-bold text-gray-500 uppercase block">
              Workflow Actions
            </span>

            {task.status === "COMPLETED" ? (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg font-semibold">
                ✓ Task Completed
              </div>
            ) : (
              <div className="flex gap-2">
                {showAssigneeActions && task.status === "ASSIGNED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange("IN_PROGRESS")}
                  >
                    Start Work
                  </Button>
                )}

                {showAssigneeActions &&
                  ["IN_PROGRESS", "REJECTED", "OVERDUE"].includes(task.status) && (
                    <Button onClick={() => onStatusChange("SUBMITTED")}>
                      Submit for Review
                    </Button>
                  )}

                {showApproverActions && task.status === "SUBMITTED" && (
                  <>
                    <Button
                      variant="success"
                      onClick={() => handleStatusAction("approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleStatusAction("reject")}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {showApproverActions && task.status === "APPROVED" && (
                  <Button
                    variant="success"
                    onClick={() => onStatusChange("COMPLETED")}
                    styleClass="!w-auto"
                  >
                    Mark Completed
                  </Button>
                )}

                {can("create_task") &&
                  !["COMPLETED", "CANCELLED", "APPROVED"].includes(task.status) && (
                    <Button
                      variant="outline"
                      onClick={() => onStatusChange("CANCELLED")}
                    >
                      Cancel Task
                    </Button>
                  )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {dueDateHistory.length > 0 && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">
              Due Date History
            </h3>
            <ul className="space-y-2 text-sm">
              {dueDateHistory.map((log) => (
                <li key={log.id} className="bg-gray-50 p-2 rounded-lg">
                  <span className="text-gray-500">
                    {formatDateTime(log.createdAt)}
                  </span>
                  <p className="text-gray-700">
                    {log.oldValue?.dueDate
                      ? formatDateTime(log.oldValue.dueDate)
                      : "—"}{" "}
                    →{" "}
                    {log.newValue?.dueDate
                      ? formatDateTime(log.newValue.dueDate)
                      : "—"}
                  </p>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      <ApproveRejectModel
        isOpen={showActionModal}
        type={actionType}
        remarks={actionRemarks}
        setRemarks={setActionRemarks}
        loading={loading}
        onClose={() => {
          setShowActionModal(false);
          setActionRemarks("");
        }}
        onConfirm={confirmStatusChange}
      />
    </>
  );
};

export default TaskAttributesSection;