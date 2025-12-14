import apiClient from "./apiClient.js";

export async function getMe() {
  const { data } = await apiClient.get("/users/me");
  return data;
}

export async function updateMe(payload) {
  const { data } = await apiClient.put("/users/me", payload);
  return data;
}
