import axiosInstance from "./axiosConfig";
import { apiEndPoints } from "../helpers/constants";

export const documentTypeApi = {
  getAll: (params = {}) =>
    axiosInstance.get(apiEndPoints.getAllDocumentTypes, { params }),

  getById: (id) =>
    axiosInstance.get(apiEndPoints.documentTypeById(id)),

  create: (data) =>
    axiosInstance.post(apiEndPoints.createDocumentType, data),

  update: (id, data) =>
    axiosInstance.put(apiEndPoints.updateDocumentType(id), data),

  delete: (id) =>
    axiosInstance.delete(apiEndPoints.deleteDocumentType(id)),
};
