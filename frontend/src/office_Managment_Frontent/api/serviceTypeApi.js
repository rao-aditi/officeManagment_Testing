import axiosInstance from "./axiosConfig";
import { apiEndPoints } from "../helpers/constants";

export const serviceTypeApi = {
  getAll: () =>
    axiosInstance.get(apiEndPoints.getAllserviceTypes),

  getById: (id) =>
    axiosInstance.get(apiEndPoints.serviceTypeById(id)),

  create: (data) =>
    axiosInstance.post(apiEndPoints.createServiceType, data),

  update: (id, data) =>
    axiosInstance.put(apiEndPoints.updateServiceType(id), data),

  delete: (id) =>
    axiosInstance.delete(apiEndPoints.deleteServiceType(id)),
};