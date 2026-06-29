import axiosInstance from "./axiosConfig";
import { apiEndPoints } from "../helpers/constants";

export const clientApi = {
  getAllClients: (params = {}) =>
    axiosInstance.get(apiEndPoints.allClients, { params }),
  getById: (id) => axiosInstance.get(apiEndPoints.clientById(id)),
};
