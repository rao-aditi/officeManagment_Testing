import axiosInstance from "./axiosConfig";
import { apiEndPoints } from "../helpers/constants";

export const quotationApi = {
  getAll: (params = {}) =>
    axiosInstance.get(apiEndPoints.getAllQuotations, { params }),

  getById: (id) => axiosInstance.get(apiEndPoints.quotationById(id)),

  create: (data) => axiosInstance.post(apiEndPoints.createQuotation, data),

  update: (id, data) =>
    axiosInstance.put(apiEndPoints.updateQuotation(id), data),

  updateStatus: (id, status) =>
    axiosInstance.patch(apiEndPoints.updateQuotationStatus(id), { status }),
};
