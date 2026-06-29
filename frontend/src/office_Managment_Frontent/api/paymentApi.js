import axiosInstance from "./axiosConfig";
import { apiEndPoints } from "../helpers/constants";

export const paymentApi = {
  getAll: (params = {}) =>
    axiosInstance.get(apiEndPoints.getAllPayments, { params }),

  getById: (id) => axiosInstance.get(apiEndPoints.paymentById(id)),

  getByInvoice: (invoiceId) =>
    axiosInstance.get(apiEndPoints.paymentsByInvoice(invoiceId)),

  create: (data) => axiosInstance.post(apiEndPoints.createPayment, data),
};
