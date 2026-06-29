import axiosInstance from "./axiosConfig";
import { apiEndPoints } from "../helpers/constants";

export const documentApi = {
  getAllDocuments: (params = {}) =>
    axiosInstance.get(apiEndPoints.getAllDocuments, { params }),

  getDocumentById: (id) =>
    axiosInstance.get(apiEndPoints.documentById(id)),

  uploadDocument: (formData) =>
    axiosInstance.post(apiEndPoints.uploadDocument, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteDocument: (id) =>
    axiosInstance.delete(apiEndPoints.deleteDocument(id)),

  getDocumentStats: () =>
    axiosInstance.get(apiEndPoints.documentStats),

  downloadDocument: (id) =>
    axiosInstance.get(apiEndPoints.downloadDocument(id), {
      responseType: "blob",
    }),

  viewDocument: (id) =>
    axiosInstance.get(apiEndPoints.viewDocument(id), {
      responseType: "blob",
    }),
};
