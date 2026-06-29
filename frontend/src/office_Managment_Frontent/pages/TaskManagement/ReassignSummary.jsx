import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchTasks,
  fetchAssignees,
  reassignTask,
} from "../../store/slice/task/taskSlice";
import { useTaskEnums } from "../../Hooks/useTaskEnums";
import Card, { CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import SelectInput from "../../components/ui/SelectInput";
import DataTable from "../../components/common/Datatable";
import { Shuffle } from "lucide-react";
import {
  useAlert
} from "../../helpers/AlertContent";
import {
  formatEnumLabel,
  getClientDisplayName,
} from "../../helpers/commonFunctions";
import Loader from "../../components/Loader/Loader";

const ReassignSummary = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showAlert } = useAlert
    ();
  const { tasks, assignees, loading, assigneesLoading, actionLoading } = useSelector((state) => state.tasks);
  useTaskEnums();

  const [reassigningId, setReassigningId] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [remarks, setRemarks] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchTasks({ limit: 50 }));
    dispatch(fetchAssignees());
  }, [dispatch]);

  const assigneeOptions = (assignees || []).map((u) => ({
    value: u.id,
    label: u.name,
  }));

  const openReassign = (taskId, currentAssigneeId) => {
    setReassigningId(taskId);
    setSelectedAssignee(currentAssigneeId || "");
    setRemarks("");
  };

  const handleReassign = async (taskId) => {
    if (!selectedAssignee) {
      showAlert({
        type: "error",
        title: "Validation",
        message: "Please select a team member.",
      });
      return;
    }
    try {
      await dispatch(
        reassignTask({
          id: taskId,
          data: {
            assignedToId: selectedAssignee,
            remarks: remarks.trim() || undefined,
          },
        })
      ).unwrap();
      showAlert({
        type: "success",
        title: "Reassigned",
        message: "Task reassigned successfully.",
      });
      setReassigningId(null);
      dispatch(fetchTasks({ limit: 50 }));
    } catch (error) {
      showAlert({ type: "error", title: "Error", message: error });
    }
  };

  const activeTasks = tasks.filter(
    (t) => !["COMPLETED", "CANCELLED"].includes(t.status)
  );

  const columns = [
    {
      id: "title",
      label: "Task Name",
      minWidth: "200px",
    },
    {
      id: "client",
      label: "Client",
      minWidth: "150px",
    },
    {
      id: "currentAssignee",
      label: "Current Assignee",
      minWidth: "150px",
    },
    {
      id: "assignedBy",
      label: "Assigned By",
      minWidth: "150px",
    },
    {
      id: "status",
      label: "Status",
      minWidth: "100px",
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: "150px",
      enabled: true,
    },
  ];

  const renderRow = (data, visibleColumns) => {
    return data.map((task) => (
      <tr key={task.id} className="hover:bg-gray-50 border-b border-gray-100 text-sm">
        {visibleColumns.map((col) => {
          if (col.id === "title") {
            return (
              <td key={col.id} className="px-4 py-4 font-semibold text-gray-900">
                <button
                  type="button"
                  className="hover:text-[#04506B] text-left"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  {task.title}
                </button>
              </td>
            );
          }
          if (col.id === "client") {
            return (
              <td key={col.id} className="px-4 py-2.5 text-gray-600">
                {getClientDisplayName(task.client)}
              </td>
            );
          }
          if (col.id === "currentAssignee") {
            return (
              <td key={col.id} className="px-4 py-2.5 text-gray-800">
                {task.assignedTo?.name || "Unassigned"}
              </td>
            );
          }
          if (col.id === "assignedBy") {
            return (
              <td key={col.id} className="px-4 py-2.5 text-gray-500">
                {task.assignedBy?.name || "—"}
              </td>
            );
          }
          if (col.id === "status") {
            return (
              <td key={col.id} className="px-4 py-2.5">
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-semibold">
                  {formatEnumLabel(task.status)}
                </span>
              </td>
            );
          }
          if (col.id === "actions") {
            return (
              <td key={col.id} className="px-4 py-2.5 text-left">
                {reassigningId === task.id ? (
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <SelectInput
                      value={selectedAssignee}
                      onChange={setSelectedAssignee}
                      options={assigneeOptions}
                      placeholder="Select member"
                      disabled={assigneesLoading}
                    />
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Remarks (optional)"
                      className="px-2 py-2 border border-gray-300 rounded text-sm"
                    />
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        styleClass="w-full"
                        loading={actionLoading}
                        onClick={() => handleReassign(task.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        styleClass="w-full"
                        variant="outline"
                        onClick={() => setReassigningId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <Button
                      size="sm"
                      variant="outline"
                      styleClass="!w-auto"
                      onClick={() => openReassign(task.id, task.assignedToId)}
                    >
                      Reassign
                    </Button>
                  </div>
                )}
              </td>
            );
          }
          return null;
        })}
      </tr>
    ));
  };

  // Paginate data
  const paginatedData = activeTasks.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <>
      {(loading || assigneesLoading || actionLoading) && (
        <Loader />
      )}
      <div className="space-y-6 mx-auto">
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shuffle size={24} /> Task Assignment & Reassignments
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Review active tasks and reassign them to other team members.
          </p>
        </div>

        <Card>
          <CardBody className="p-0">
            <DataTable
              columns={columns}
              data={paginatedData}
              renderRow={renderRow}
              rowsPerPage={rowsPerPage}
              currentPage={currentPage}
              totalRecords={activeTasks.length}
              setRowsPerPage={setRowsPerPage}
              setCurrentPage={setCurrentPage}
              sortable={false}
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
};

export default ReassignSummary;