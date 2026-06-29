import axiosInstance from "./axiosConfig";
import { apiEndPoints } from "../helpers/constants";

export const dueDateApi = {
  getDashboard: () => axiosInstance.get(apiEndPoints.dueDatesDashboard),

  changeTaskDueDate: (taskId, data) =>
    axiosInstance.patch(apiEndPoints.dueDateTask(taskId), data),

  getDueDateHistory: (taskId) =>
    axiosInstance.get(apiEndPoints.dueDateTaskHistory(taskId)),

  getTaskReminders: (taskId) =>
    axiosInstance.get(apiEndPoints.taskReminders(taskId)),

  createReminder: (taskId, data) =>
    axiosInstance.post(apiEndPoints.taskReminders(taskId), data),

  getMyReminders: (params = {}) =>
    axiosInstance.get(apiEndPoints.myReminders, { params }),

  updateReminder: (reminderId, data) =>
    axiosInstance.patch(apiEndPoints.reminderById(reminderId), data),

  cancelReminder: (reminderId) =>
    axiosInstance.delete(apiEndPoints.reminderById(reminderId)),
};
