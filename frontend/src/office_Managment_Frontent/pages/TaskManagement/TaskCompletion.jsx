import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchTasks, updateTaskStatus } from "../../store/slice/task/taskSlice";
import { useTaskEnums } from "../../Hooks/useTaskEnums";
import Card, { CardBody } from "../../components/ui/Card";
import { CheckCircle2, Play, Check } from "lucide-react";
import {
  useAlert
} from "../../helpers/AlertContent";
import {
  formatEnumLabel,
  getClientDisplayName,
  formatDate,
} from "../../helpers/commonFunctions";
import { getUserId } from "../../helpers/commonFunctions";
import Button from "../../components/ui/Button";
import Loader from "@/office_Managment_Frontent/components/Loader/Loader";

const TaskCompletion = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showAlert } = useAlert
    ();
  const { tasks, loading } = useSelector((state) => state.tasks);
  useTaskEnums();

  const userId = getUserId();

  const loadMyTasks = useCallback(() => {
    if (!userId) return;
    dispatch(fetchTasks({ assignedToId: userId, limit: 50 }));
  }, [dispatch, userId]);

  useEffect(() => {
    loadMyTasks();
  }, [loadMyTasks]);

  const handleStatusUpdate = async (taskId, status) => {
    try {
      await dispatch(
        updateTaskStatus({ id: taskId, data: { status } })
      ).unwrap();
      showAlert({
        type: "success",
        title: "Task Status Updated",
        message: `Updated to ${formatEnumLabel(status)}.`,
      });
      loadMyTasks();
    } catch (error) {
      showAlert({ type: "error", title: "Error", message: error });
    }
  };

  return (
    <>
      {loading && (
        <Loader />
      )}

      <div className="space-y-6 mx-auto">
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle2 size={24} /> My Task Completion
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Review your assigned tasks, update their progress, or submit them for
            manager approval.
          </p>
        </div>

        <div className="space-y-4">
          {tasks.length === 0 ? (
            <Card>
              <CardBody className="text-center py-10 text-gray-500">
                No tasks currently assigned to you.
              </CardBody>
            </Card>
          ) : (
            tasks.map((task) => {
              const items = task.checklist || [];
              const progress =
                items.length > 0
                  ? Math.round(
                    (items.filter((i) => i.isCompleted).length / items.length) *
                    100
                  )
                  : null;

              return (
                <Card
                  key={task.id}
                  className="hover:shadow-sm transition-all border border-gray-200 cursor-pointer"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  <CardBody className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-base">
                          {task.title}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-sm font-semibold bg-blue-100 text-gray-800">
                          {(task.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>
                          Client:{" "}
                          <strong className="text-gray-600">
                            {getClientDisplayName(task.client)}
                          </strong>
                        </span>
                        <span>
                          Due_Date :{" "}
                          <strong className="text-gray-600">
                            {task.dueDate ? formatDate(task.dueDate) : "—"}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div
                      className="flex flex-col items-end gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {progress !== null && (
                        <>
                          <div className="w-full md:w-40 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#04506B] h-2 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="text-sm text-gray-500 font-semibold">
                            {progress}% Checklist
                          </div>
                        </>
                      )}

                      <div className="flex gap-2">
                        {task.status === "ASSIGNED" && (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleStatusUpdate(task.id, "IN_PROGRESS")}
                            className="px-3 py-1.5 border border-[#04506B] text-[#04506B] hover:bg-gray-50 rounded-xl text-sm flex items-center gap-1 font-semibold"
                          >
                            <Play size={12} /> Start Work
                          </button>
                        )}

                        {["IN_PROGRESS", "REJECTED", "OVERDUE"].includes(task.status) && (
                          <Button
                            disabled={loading}
                            onClick={() => handleStatusUpdate(task.id, "SUBMITTED")}
                            variant="outline"
                            size="sm"
                          >
                            <Check size={12} /> Submit Review
                          </Button>
                        )}

                        {task.status === "SUBMITTED" && (
                          <span className="text-sm text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded">
                            Awaiting Approval
                          </span>
                        )}

                        {task.status === "APPROVED" && (
                          <span className="text-sm text-blue-700 font-semibold bg-blue-100 px-2 py-1 rounded">
                            ✓ Approved
                          </span>
                        )}

                        {task.status === "COMPLETED" && (
                          <span className="text-sm text-green-700 font-semibold bg-green-100 px-2 py-1 rounded">
                            Task Completed
                          </span>
                        )}
                      </div>

                    </div>
                  </CardBody>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default TaskCompletion;
