// TaskDetail.jsx (Refactored)
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTaskById,
  fetchTaskHistory,
  updateTaskStatus,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  clearSelectedTask,
} from "../../store/slice/task/taskSlice";
import {
  changeTaskDueDate,
  fetchDueDateHistory,
  fetchTaskReminders,
  clearTaskReminders,
} from "../../store/slice/dueDate/dueDateSlice";
import { useTaskEnums } from "../../Hooks/useTaskEnums";
import Card, { CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";
import { useAlert } from "../../helpers/AlertContent";
import { formatDateTime, toIsoDateTime, getUserId, getPriorityBadge, getTaskStatusBadge } from "../../helpers/commonFunctions";
import { usePermission } from "../../Hooks/usePermission";
import Loader from "@/office_Managment_Frontent/components/Loader/Loader";
import RemindersSection from "@/office_Managment_Frontent/components/TaskManagement/RemindersSection";
import ChecklistSection from "@/office_Managment_Frontent/components/TaskManagement/ChecklistSection";
import StatusHistorySection from "@/office_Managment_Frontent/components/TaskManagement/StatusHistorySection";
import TaskAttributesSection from "@/office_Managment_Frontent/components/TaskManagement/TaskAttributesSection";
import DocumentsSection from "@/office_Managment_Frontent/components/Documents/DocumentsSection";

const TaskDetail = () => {
  const { canAny } = usePermission();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const [showDocuments, setShowDocuments] = useState(false);
  useTaskEnums();

  const {
    selectedTask: task,
    loading,
    statusHistory,
  } = useSelector((state) => state.tasks);
  const {
    taskReminders,
    dueDateHistory,
    loading: dueDateLoading,
  } = useSelector((state) => state.dueDates);

  const [statusRemarks, setStatusRemarks] = useState("");
  const currentUserId = getUserId();
  const isAssignee = task?.assignedToId === currentUserId;

  useEffect(() => {
    if (id) {
      dispatch(fetchTaskById(id));
      dispatch(fetchTaskHistory(id));
      dispatch(fetchTaskReminders(id));
      dispatch(fetchDueDateHistory(id));
    }
    return () => {
      dispatch(clearSelectedTask());
      dispatch(clearTaskReminders());
    };
  }, [dispatch, id]);

  const handleStatusChange = async (status, remarksParam = "") => {
    if (!task) return;

    try {
      const response = await dispatch(
        updateTaskStatus({
          id: task.id,
          data: {
            status,
            remarks: remarksParam || statusRemarks.trim() || undefined,
          },
        })
      ).unwrap();

      showAlert({
        type: "success",
        title: "Success",
        message: response?.message || "Task status updated successfully.",
      });

      setStatusRemarks("");
      dispatch(fetchTaskById(id));
      dispatch(fetchTaskHistory(id));

      if (status === "COMPLETED") {
        navigate("/task-completion");
      }
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error",
        message:
          error?.message ||
          error?.response?.data?.message ||
          "Something went wrong.",
      });
    }
  };

  const handleDueDateChange = async (dueDateInput, dueDateReason) => {
    if (!dueDateInput) return;
    try {
      await dispatch(
        changeTaskDueDate({
          taskId: id,
          data: {
            dueDate: toIsoDateTime(dueDateInput),
            reason: dueDateReason.trim() || undefined,
          },
        })
      ).unwrap();
      await dispatch(fetchTaskById(id)).unwrap();
      dispatch(fetchDueDateHistory(id));
      dispatch(fetchTaskReminders(id));
      showAlert({
        type: "success",
        title: "Due Date Updated",
        message: "Task due date has been updated.",
      });
    } catch (error) {
      showAlert({ type: "error", title: "Error", message: error });
    }
  };

  const handleAddChecklist = async (title) => {
    return await dispatch(addChecklistItem({ taskId: id, title })).unwrap();
  };

  const handleToggleChecklist = async (checklistId) => {
    return await dispatch(toggleChecklistItem({ taskId: id, checklistId })).unwrap();
  };

  const handleDeleteChecklist = async (checklistId) => {
    return await dispatch(deleteChecklistItem({ taskId: id, checklistId })).unwrap();
  };

  const refreshReminders = () => {
    dispatch(fetchTaskReminders(id));
  };

  if (!task || dueDateLoading) {
    return <Loader />;
  }

  return (
    <>
      {(loading || dueDateLoading) && <Loader />}

      <div className="space-y-6 mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/tasks")}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Task Detail</h1>
          </div>
          <div>
            {canAny([
              "reassign_task",
              "reassign_task_within_team",
            ]) && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate("/reassign-summary")}
                >
                  Reassign
                </Button>
              )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-3/5 space-y-4">
            <Card>
              <CardBody className="p-6 space-y-4">
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                      {task.title}
                    </h2>
                    <span className="text-sm font-semibold">
                      Task Type: {task.taskType}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Created on {formatDateTime(task.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(task.priority)}`}>
                      {task.priority} PRIORITY
                    </span>
                    <span className={`px-2 py-0.5 text-sm rounded-full font-semibold ${getTaskStatusBadge(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>

                {task.remarks && (
                  <div className="flex gap-2 items-center">
                    <h4 className="text-sm font-semibold text-gray-700">Remarks</h4> :{" "}
                    <p className="text-sm text-gray-600 mt-1">{task.remarks}</p>
                  </div>
                )}

                <ChecklistSection
                  taskId={id}
                  checklist={task.checklist}
                  onToggle={handleToggleChecklist}
                  onDelete={handleDeleteChecklist}
                  onAdd={handleAddChecklist}
                  loading={loading}
                />
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Documents
                  </h3>

                  <button
                    size="sm"
                    onClick={() => setShowDocuments((prev) => !prev)}
                  >
                    {showDocuments ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {showDocuments && (
                  <DocumentsSection
                    taskId={id}
                    clientId={task.client_Id}
                    compact
                  />
                )}
              </CardBody>
            </Card>

            <RemindersSection
              taskId={id}
              reminders={taskReminders}
              taskStatus={task.status}
              onRefresh={refreshReminders}
            />
          </div>

          <div className="lg:w-2/5 space-y-6 mb-10">
            <TaskAttributesSection
              task={task}
              dueDateHistory={dueDateHistory}
              onDueDateChange={handleDueDateChange}
              onStatusChange={handleStatusChange}
              loading={loading}
              dueDateLoading={dueDateLoading}
            />

            <StatusHistorySection history={statusHistory} />
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskDetail;