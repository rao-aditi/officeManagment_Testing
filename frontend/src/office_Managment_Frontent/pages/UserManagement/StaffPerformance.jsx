import React, { useEffect, useState } from "react";
import { userApi } from "../../api/userApi";
import { taskApi } from "../../api/taskApi";
import Card, { CardBody } from "../../components/ui/Card";
import { BarChart3, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import Loader from "../../components/Loader/Loader";

const StaffPerformance = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, tasksRes] = await Promise.all([
        userApi.getAllUsers(),
        taskApi.listTasks({ limit: 100 }),
      ]);

      const rawUsers = usersRes.data.data.users || [];
      const rawTasks = tasksRes.data.data.tasks || [];

      setUsers(rawUsers);
      setTasks(rawTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStaffKPIs = () => {
    const staffUsers = users.filter(u => u.role === "team_member" || u.role === "team_leader");

    return staffUsers.map(user => {
      const staffTasks = tasks.filter(t => t.assignedTo?.id === user.id);
      const activeTasks = staffTasks.filter(t => ["ASSIGNED", "IN_PROGRESS"].includes(t.status));
      const completedTasks = staffTasks.filter(t => ["COMPLETED", "APPROVED"].includes(t.status));
      const submittedTasks = staffTasks.filter(t => t.status === "SUBMITTED");
      const overdueTasks = staffTasks.filter(t => t.status === "OVERDUE" || (new Date(t.dueDate) < new Date() && t.status !== "COMPLETED" && t.status !== "APPROVED"));

      const completionRate = staffTasks.length > 0
        ? Math.round((completedTasks.length / staffTasks.length) * 100)
        : 0;

      return {
        ...user,
        totalTasks: staffTasks.length,
        activeTasks: activeTasks.length,
        completedTasks: completedTasks.length,
        submittedTasks: submittedTasks.length,
        overdueTasks: overdueTasks.length,
        completionRate
      };
    });
  };

  const staffPerformanceData = getStaffKPIs();

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 size={24} /> Staff Performance & Load Tracking
        </h1>
        <p className="text-white/70 text-sm mt-1">
          Monitor current task load, overdue alerts, and completion rates of the operations team.
        </p>
      </div>

      {loading ? (
        <Loader inline />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffPerformanceData.map((staff) => (
            <Card key={staff.id} className="hover:shadow-md transition-all border border-gray-100">
              <CardBody className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <img
                    src={staff.profilePhoto || "https://i.pravatar.cc/40"}
                    alt={staff.name}
                    className="w-12 h-12 rounded-full border bg-gray-50"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{staff.name}</h3>
                    <p className="text-sm text-gray-400 capitalize">{staff.role?.replace("_", " ")}</p>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-sm font-semibold text-gray-500 uppercase block">Active Load</span>
                    <span className="text-xl font-bold text-blue-700 block mt-0.5">{staff.activeTasks}</span>
                  </div>
                  <div className="bg-red-50/50 p-2.5 rounded-xl border border-red-100">
                    <span className="text-sm font-semibold text-gray-500 uppercase block">Overdue</span>
                    <span className="text-xl font-bold text-red-700 block mt-0.5">{staff.overdueTasks}</span>
                  </div>
                  <div className="bg-yellow-50/50 p-2.5 rounded-xl border border-yellow-100">
                    <span className="text-sm font-semibold text-gray-500 uppercase block">Submitted</span>
                    <span className="text-xl font-bold text-yellow-700 block mt-0.5">{staff.submittedTasks}</span>
                  </div>
                  <div className="bg-green-50/50 p-2.5 rounded-xl border border-green-100">
                    <span className="text-sm font-semibold text-gray-500 uppercase block">Completed</span>
                    <span className="text-xl font-bold text-green-700 block mt-0.5">{staff.completedTasks}</span>
                  </div>
                </div>

                {/* Progress KPI */}
                <div className="pt-2">
                  <div className="flex justify-between items-center text-sm font-semibold mb-1">
                    <span className="text-gray-500">Completion Rate</span>
                    <span className="text-green-700 font-bold">{staff.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${staff.completionRate}%` }}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffPerformance;
