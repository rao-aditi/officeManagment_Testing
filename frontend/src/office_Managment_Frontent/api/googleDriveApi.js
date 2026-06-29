import axiosInstance from "./axiosConfig";
import { apiEndPoints } from "../helpers/constants";

export const googleDriveApi = {
  getAuthUrl: () => axiosInstance.get(apiEndPoints.googleDriveAuthUrl),

  getStatus: () => axiosInstance.get(apiEndPoints.googleDriveStatus),

  disconnect: () => axiosInstance.delete(apiEndPoints.googleDriveDisconnect),
};
