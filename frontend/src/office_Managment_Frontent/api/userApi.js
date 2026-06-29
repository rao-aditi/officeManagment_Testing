import axiosInstance from "./axiosConfig";
import { apiEndPoints } from "../helpers/constants";

export const userApi = {
  getAllUsers: (params = {}) =>
    axiosInstance.get(apiEndPoints.allUsers, { params }),

  createUser: (userData) =>
    axiosInstance.post(apiEndPoints.addUser, userData),

  updateUser: ({ id, data }) =>
    axiosInstance.put(apiEndPoints.updateUser(id), data),

  activateUser: (id) =>
    axiosInstance.patch(apiEndPoints.activateUser(id)),

  deactivateUser: (id) =>
    axiosInstance.patch(apiEndPoints.deactivateUser(id)),

  getUserById: (id) =>
    axiosInstance.post(apiEndPoints.getUserById , { id }),
};