import React from "react";
import { Calendar, ChevronRight, Briefcase } from "lucide-react";

const UpcomingDues = ({ dues }) => {
  const getStatusStyles = (status) => {
    if (status === "urgent") return "bg-red-100 text-red-700";
    if (status === "warning") return "bg-amber-100 text-amber-700";
    return "bg-green-100 text-green-700";
  };

  const getIconStyles = (status) => {
    if (status === "urgent") return "text-red-600";
    if (status === "warning") return "text-amber-600";
    return "text-green-600";
  };

  return (
    <div className="bg-white border border-gray-300 rounded-2xl shadow-sm mb-5 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-xl">
            <Calendar size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Upcoming Due Dates</h3>
            <p className="text-sm text-gray-500">Important compliance reminders</p>
          </div>
        </div>
        <button className="text-cyanDark text-sm font-semibold flex items-center gap-1">
          View All
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5">
        {dues.map((due) => (
          <div key={due.id} className="border border-gray-300 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 bg-white">
            <div className="flex items-center justify-between mb-1">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${getStatusStyles(due.status).replace("text", "bg").replace("bg-red-700", "bg-red-100")}`}>
                <Briefcase size={20} className={getIconStyles(due.status)} />
              </div>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusStyles(due.status)}`}>
                {due.category}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">{due.title} <span className="text-sm text-gray-500 mt-1">({due.client})</span></h3>
            <div className="mt-1 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Due Date</p>
                <p className="text-sm font-semibold text-gray-700">{due.dueDate}</p>
              </div>
              <button className="text-cyanDark text-sm font-semibold">Open</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingDues;