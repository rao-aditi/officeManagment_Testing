import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchTasks, clearTaskError } from "../../store/slice/task/taskSlice";
import { useTaskEnums } from "../../Hooks/useTaskEnums";
import Card, { CardBody } from "../../components/ui/Card";
import {
  ClipboardList,
  PlusCircle,
  Clock,
} from "lucide-react";
import {
  formatEnumLabel,
  getClientDisplayName,
  formatDate,
  getTaskStatusBadge,
  getPriorityBadge,
} from "../../helpers/commonFunctions";
import {
  useAlert
} from "../../helpers/AlertContent";
import { usePermission } from "../../Hooks/usePermission";
import SelectInput from "../../components/ui/SelectInput";
import Loader from "../../components/Loader/Loader";
import TaskForm from "./TaskForm";
import SearchInput from "@/office_Managment_Frontent/components/common/SearchInput";

const isPermissionDenied = (message) =>
  typeof message === "string" &&
  /access denied|insufficient permissions/i.test(message);

const TaskList = () => {
  const { can } = usePermission();
  const canCreateTask = can("create_task");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showAlert } = useAlert
    ();
  const { tasks, pagination, loading, error } = useSelector((state) => state.tasks);
  const { enums } = useTaskEnums();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const loadTasks = useCallback(() => {
    const params = { page: currentPage, limit };
    if (statusFilter !== "ALL") params.status = statusFilter;
    if (priorityFilter !== "ALL") params.priority = priorityFilter;
    dispatch(fetchTasks(params));
  }, [dispatch, currentPage, limit, statusFilter, priorityFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (!error) return;
    if (!isPermissionDenied(error)) {
      showAlert({ type: "error", title: "Error", message: error });
    }
    dispatch(clearTaskError());
  }, [error, showAlert, dispatch]);

  const statusOptions = useMemo(
    () => [
      { value: "ALL", label: "All Status" },
      ...(enums?.taskStatus || []).map((s) => ({
        value: s,
        label: formatEnumLabel(s),
      })),
    ],
    [enums?.taskStatus]
  );

  const priorityOptions = useMemo(
    () => [
      { value: "ALL", label: "All Priorities" },
      ...(enums?.taskPriority || []).map((p) => ({
        value: p,
        label: (p),
      })),
    ],
    [enums?.taskPriority]
  );

  const filteredTasks = useMemo(() => {
    if (!searchTerm.trim()) return tasks;
    const q = searchTerm.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title?.toLowerCase().includes(q) ||
        getClientDisplayName(task.client).toLowerCase().includes(q) ||
        task.assignedTo?.name?.toLowerCase().includes(q)
    );
  }, [tasks, searchTerm]);

  const checklistProgress = (task) => {
    const items = task.checklist || [];
    if (!items.length) return null;
    const done = items.filter((i) => i.isCompleted).length;
    return Math.round((done / items.length) * 100);
  };

  return (
    <>
      {loading && (
        <Loader />
      )}

      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
          <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ClipboardList size={24} /> Task Management
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Track tasks, workflow progress, due dates, and assignments.
              </p>
            </div>
            {canCreateTask && (
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="bg-white text-cyanDark hover:bg-gray-100 font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow flex items-center gap-2 text-sm"
              >
                <PlusCircle size={16} /> Assign Task
              </button>
            )}
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
        </div>

        <Card>
          <CardBody className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:max-w-xs">
              <SearchInput
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={setSearchTerm}
                width="100%"
                className="w-full"
              />
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <SelectInput
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
                options={statusOptions}
                placeholder="All Status"
                wrapperClass="min-w-[180px]"
              />

              <SelectInput
                value={priorityFilter}
                onChange={(value) => {
                  setPriorityFilter(value);
                  setCurrentPage(1);
                }}
                options={priorityOptions}
                placeholder="All Priorities"
                wrapperClass="min-w-[180px]"
              />
            </div>
          </CardBody>
        </Card>

        <div className="pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.length === 0 ? (
              <div className="col-span-full text-center py-10 text-gray-500">
                No tasks found
              </div>
            ) : (
              filteredTasks.map((task) => {
                const progress = checklistProgress(task);
                return (
                  <Card
                    key={task.id}
                    className="hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer border border-gray-200 rounded-2xl overflow-hidden"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-sm font-semibold border ${getPriorityBadge(task.priority)}`}
                        >
                          {(task.priority)} PRIORITY
                        </span>
                        <span
                          className={`px-2 py-0.5 text-sm rounded-full font-semibold ${getTaskStatusBadge(
                            task.status
                          )}`}
                        >
                          {(task.status)}
                        </span>
                      </div>

                      <div className=" mb-2">
                        <h3 className="font-bold text-gray-800 text-base line-clamp-1">
                          {task.title}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          Task_Type : <span className="font-bold"> {task.serviceType?.name}</span>
                        </p>
                      </div>

                      <div className="border-t border-gray-200 pt-1.5 flex items-center justify-between text-sm text-gray-500">
                        <div>
                          <span>Client</span>
                          <span className="font-semibold block text-gray-700">
                            {getClientDisplayName(task.client)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span>Assigned To</span>
                          <span className="font-semibold block text-gray-700">
                            {task.assignedTo?.name || "Unassigned"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-2 rounded-xl flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-gray-400" />
                          <span>
                            Due:{" "}
                            {formatDate(task.dueDate)}
                          </span>
                        </div>
                        {progress !== null && (
                          <span className="font-bold text-[#04506B]">{progress}%</span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 self-center">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              disabled={currentPage >= pagination.totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {canCreateTask && (
          <TaskForm
            isOpen={isTaskModalOpen}
            onClose={() => {
              setIsTaskModalOpen(false);
              loadTasks();
            }}
          />
        )}

      </div>
    </>
  );
};

export default TaskList;
