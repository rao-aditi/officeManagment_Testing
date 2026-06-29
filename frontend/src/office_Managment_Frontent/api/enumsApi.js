import axiosInstance from "./axiosConfig";
import { apiEndPoints } from "../helpers/constants";

export const enumsApi = {
  fetchEnums: (keys) =>
    axiosInstance.post(apiEndPoints.getEnums, keys),
};
