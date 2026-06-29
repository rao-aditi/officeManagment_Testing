import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchDueDateDashboard,
  fetchMyReminders,
  updateReminder,
  cancelReminder,
} from "../../store/slice/dueDate/dueDateSlice";
import { useTaskEnums } from "../../Hooks/useTaskEnums";
import Card, { CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  CalendarClock,
  AlertCircle,
  CheckCircle,
  Bell,
  Clock,
} from "lucide-react";
import {
  useAlert
} from "../../helpers/AlertContent";
import Loader from "../../components/Loader/Loader";
import {
  formatEnumLabel,
  formatDateTime,
  toLocalDateTimeInput,
  toIsoDateTime,
  getClientDisplayName,
} from "../../helpers/commonFunctions";

const DueDateReminder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showAlert } = useAlert
    ();
  const { dashboard, myReminders, loading } = useSelector(
    (state) => state.dueDates
  );
  useTaskEnums();

  const [editingId, setEditingId] = useState(null);
  const [editRemindAt, setEditRemindAt] = useState("");
  const [editMessage, setEditMessage] = useState("");

  useEffect(() => {
    dispatch(fetchDueDateDashboard());
    dispatch(fetchMyReminders({ upcoming: true, limit: 50 }));
  }, [dispatch]);

  const summary = dashboard?.summary || {};
  const upcomingFromDashboard = dashboard?.upcomingReminders || [];
  const upcomingTasks = dashboard?.upcomingTasks || [];

  const startEdit = (reminder) => {
    setEditingId(reminder.id);
    setEditRemindAt(toLocalDateTimeInput(reminder.remindAt));
    setEditMessage(reminder.message || "");
  };

  const handleUpdateReminder = async (reminderId, taskId) => {
    try {
      await dispatch(
        updateReminder({
          reminderId,
          taskId,
          data: {
            remindAt: toIsoDateTime(editRemindAt),
            message: editMessage.trim() || undefined,
          },
        })
      ).unwrap();
      setEditingId(null);
      dispatch(fetchMyReminders({ upcoming: true, limit: 50 }));
      dispatch(fetchDueDateDashboard());
      showAlert({ type: "success", title: "Updated", message: "Reminder updated." });
    } catch (error) {
      showAlert({ type: "error", title: "Error", message: error });
    }
  };

  const handleCancel = async (reminderId, taskId) => {
    if (!window.confirm("Cancel this reminder?")) return;
    try {
      await dispatch(cancelReminder({ reminderId, taskId })).unwrap();
      dispatch(fetchMyReminders({ upcoming: true, limit: 50 }));
      dispatch(fetchDueDateDashboard());
      showAlert({ type: "success", title: "Cancelled", message: "Reminder cancelled." });
    } catch (error) {
      showAlert({ type: "error", title: "Error", message: error });
    }
  };

  const statCards = [
    {
      label: "Overdue Tasks",
      value: summary.overdue ?? 0,
      icon: AlertCircle,
      color: "text-red-600 bg-red-50",
    },
    {
      label: "Due Today",
      value: summary.dueToday ?? 0,
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Due Soon (3 days)",
      value: summary.dueSoon ?? 0,
      icon: CalendarClock,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Open Tasks",
      value: summary.totalPending ?? 0,
      icon: CheckCircle,
      color: "text-green-600 bg-green-50",
    },
  ];

  const renderReminderCard = (reminder, showActions = true) => (
    <Card key={reminder.id} className="border border-gray-200">
      <CardBody className="p-5 space-y-3">
        <div className="flex justify-between items-start">
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
            {formatEnumLabel(reminder.reminderType || "CUSTOM")}
          </span>
          <Bell size={18} className="text-gray-400" />
        </div>

        <div>
          <h3 className="font-bold text-gray-900 text-base">
            {reminder.task?.title || "Task"}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Client:{" "}
            {getClientDisplayName(reminder.task?.client) || "—"}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
          <AlertCircle size={14} className="text-gray-400" />
          <span>
            Remind at: <strong>{formatDateTime(reminder.remindAt)}</strong>
          </span>
        </div>

        {reminder.message && (
          <p className="text-sm text-gray-600">{reminder.message}</p>
        )}

        {reminder.task?.id && (
          <button
            type="button"
            onClick={() => navigate(`/tasks/${reminder.task.id}`)}
            className="text-sm text-[#04506B] font-semibold hover:underline"
          >
            View Task →
          </button>
        )}
      </CardBody>
    </Card>
  );

  return (
    <>
      {loading && !dashboard && (
        <Loader />
      )}

      <div className="space-y-6 mx-auto">
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock size={24} /> Compliance Due Dates & Reminders
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Stay on top of deadlines and manage your upcoming reminders.
          </p>
        </div>

        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <Card key={label}>
                <CardBody className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${color}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500">{label}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {upcomingFromDashboard.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3">
                Upcoming Reminders (7 days)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingFromDashboard.map((r) => renderReminderCard(r, false))}
              </div>
            </div>
          )}

{upcomingFromDashboard.length === 0 && upcomingTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3">
                Tasks Requiring Attention
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingTasks.map((task) => (
                  <Card key={task.id} className="border border-gray-200">
                    <CardBody className="p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            task.status === "OVERDUE"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {task.status === "OVERDUE" ? "OVERDUE" : "DUE SOON"}
                        </span>
                        <CalendarClock size={18} className="text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{task.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Client: {getClientDisplayName(task.client) || "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                        <Clock size={14} className="text-gray-400" />
                        <span>
                          Due: <strong>{formatDateTime(task.dueDate)}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="text-sm text-[#04506B] font-semibold hover:underline"
                      >
                        View Task →
                      </button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          <div className="pb-10">
            <h2 className="text-lg font-bold text-gray-800 mb-3">My Reminders</h2>
            {myReminders.length === 0 ? (
              <Card>
                <CardBody className="text-center py-8 text-gray-500">
                  No upcoming reminders.
                </CardBody>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myReminders.map((r) => renderReminderCard(r))}
              </div>
            )}
          </div>
        </>
      </div>
    </>
  );
};

export default DueDateReminder;
