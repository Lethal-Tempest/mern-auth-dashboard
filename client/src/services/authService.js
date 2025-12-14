import apiClient from "./apiClient.js";
import { setToken, clearToken } from "../utils/auth.js";

export async function register({ name, email, password }) {
  console.log(apiClient);
  const { data } = await apiClient.post("/auth/register", { name, email, password });
  console.log(data)
  if (data?.token) setToken(data.token);
  return data;
}

export async function login({ email, password }) {
  const { data } = await apiClient.post("/auth/login", { email, password });
  if (data?.token) setToken(data.token);
  return data;
}

export async function logout() {
  // Backend can optionally implement /auth/logout; client still clears token regardless.
  try {
    await apiClient.post("/auth/logout");
  } finally {
    clearToken();
  }
}
