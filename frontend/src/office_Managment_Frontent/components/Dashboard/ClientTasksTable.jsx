import React, { useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import SearchInput from "../common/SearchInput";
import SelectInput from "../ui/SelectInput";

const ClientTasksTable = ({ tasks }) => {
  const [selectedTaskFilter, setSelectedTaskFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status) => {
    const styles = {
      Overdue: "bg-red-100 text-red-700",
      "In Progress": "bg-blue-100 text-blue-700",
      Pending: "bg-amber-100 text-amber-700",
      Completed: "bg-green-100 text-green-700",
    };
    return styles[status];
  };

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];
    if (selectedTaskFilter !== "all") {
      filtered = filtered.filter(
        (task) => task.status.toLowerCase() === selectedTaskFilter.toLowerCase()
      );
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.task.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [selectedTaskFilter, searchTerm, tasks]);

  return (
    <div className="bg-white border border-gray-300 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-2.5 border-b border-gray-300">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">Client Tasks</h3>
            <p className="text-sm text-gray-500">Monitor all client compliance tasks</p>
          </div>
          <div className="flex items-center gap-3">
            <SearchInput
              placeholder="Search task..."
              value={searchTerm}
              onChange={setSearchTerm}
              width="13rem"
              size="sm"
            />
            <SelectInput
              value={selectedTaskFilter}
              onChange={setSelectedTaskFilter}
              options={[
                { label: "All", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "In Progress", value: "in progress" },
                { label: "Overdue", value: "overdue" },
                { label: "Completed", value: "completed" },
              ]}
              placeholder="Filter by status"
              wrapperClass="min-w-[140px]"
              size="sm"
              selectClass="!mt-0"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase">Progress</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id} className="border-t border-gray-200 hover:bg-gray-50 transition-all">
                <td className="px-6 py-2">
                  <p className="font-semibold text-[14px] text-gray-800">{task.client}</p>
                  <p className="text-sm text-gray-500">{task.task}</p>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">{task.type}</span>
                </td>
                <td className="px-6 py-5 text-sm font-medium text-gray-700">{task.dueDate}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-cyanDark rounded-full" style={{ width: `${task.progress}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-600">{task.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t border-gray-300 flex items-center justify-between">
        <p className="text-sm text-gray-500">Showing {filteredTasks.length} Tasks</p>
        <button className="text-cyanDark font-semibold text-sm flex items-center gap-1">
          View All
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default ClientTasksTable;