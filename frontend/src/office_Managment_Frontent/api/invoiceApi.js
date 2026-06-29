import axiosInstance from "./axiosConfig";
import { apiEndPoints } from "../helpers/constants";

export const invoiceApi = {
  getAllInvoices: (params = {}) =>
    axiosInstance.get(apiEndPoints.getAllInvoices, { params }),

  getInvoiceById: (id) => axiosInstance.get(apiEndPoints.invoiceById(id)),

  createInvoice: (data) => axiosInstance.post(apiEndPoints.createInvoice, data),

  updateInvoiceStatus: (id, status) =>
    axiosInstance.patch(apiEndPoints.updateInvoiceStatus(id), { status }),

  updateInvoice: (id, data) =>
    axiosInstance.put(apiEndPoints.updateInvoice(id), data),

  cancelInvoice: (id) =>
    axiosInstance.post(apiEndPoints.cancelInvoice(id)),
};
