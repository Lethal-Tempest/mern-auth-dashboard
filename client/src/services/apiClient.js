import axios from "axios";
import { getToken, clearToken } from "../utils/auth.js";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      // Token invalid/expired; force logout locally
      clearToken();
    }
    return Promise.reject(err);
  }
);

export default apiClient;
