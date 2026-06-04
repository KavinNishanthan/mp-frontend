import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    // Unwrap the backend's { data: actualData } envelope so callers
    // receive the actual payload directly via `const { data } = await api...`
    if (
      response.data !== null &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      response.data = (response.data as { data: unknown }).data;
    }
    return response;
  },
  (error: unknown) => {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 401
    ) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
