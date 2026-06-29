import axiosInstance from "./axiosConfig";
import { apiEndPoints } from "../helpers/constants";

export const taskApi = {
  getAssignees: () => axiosInstance.get(apiEndPoints.taskAssignees),

  listTasks: (params = {}) =>
    axiosInstance.get(apiEndPoints.tasks, { params }),

  createTask: (data) => axiosInstance.post(apiEndPoints.createTask, data),

  getTaskById: (id) => axiosInstance.get(apiEndPoints.taskById(id)),

  updateTaskStatus: (id, data) =>
    axiosInstance.patch(apiEndPoints.taskStatus(id), data),

  reassignTask: (id, data) =>
    axiosInstance.patch(apiEndPoints.taskReassign(id), data),

  getTaskHistory: (id) => axiosInstance.get(apiEndPoints.taskHistory(id)),

  addChecklistItem: (id, data) =>
    axiosInstance.post(apiEndPoints.taskChecklist(id), data),

  toggleChecklistItem: (id, checklistId) =>
    axiosInstance.patch(apiEndPoints.taskChecklistToggle(id, checklistId)),

  deleteChecklistItem: (id, checklistId) =>
    axiosInstance.delete(apiEndPoints.taskChecklistDelete(id, checklistId)),
};
