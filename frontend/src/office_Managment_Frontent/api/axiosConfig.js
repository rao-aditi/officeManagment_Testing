import axios from "axios";
import { authHeaders} from "../helpers/authHeaders";

let store;

export const configureApi = (appStore) => {
  store = appStore;
};

const normalizeBaseUrl = (url) =>
  String(url || "http://localhost:5001")
    .trim()
    .replace(/\/+$/, "");

export const BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: authHeaders(),
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isTimeout = error.code === "ECONNABORTED";
    const message = isTimeout
      ? `Request timed out. Check that the API is running at ${BASE_URL}`
      : error.response?.data?.message || error.message;

    if (import.meta.env.DEV) {
      console.error("API Error:", message, error.config?.url || "");
    }

    if (error.response?.status === 401) {
      const onLoginPage = window.location.pathname.startsWith("/login");
      const isLoginRequest = error.config?.url?.includes("auth/login");
      if (!onLoginPage && !isLoginRequest) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
