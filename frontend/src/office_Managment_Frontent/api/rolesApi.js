import axiosInstance from "./axiosConfig";
import { apiEndPoints } from "../helpers/constants";

export const rolesApi = {
  listRoles: () => axiosInstance.get(apiEndPoints.listRoles),
};
