import apiClient from "./apiClient.js";

export async function listTasks({ search = "", status = "all" } = {}) {
  const params = {};
  if (search) params.search = search;
  if (status && status !== "all") params.status = status;

  const { data } = await apiClient.get("/tasks", { params });
  return data;
}

export async function createTask(payload) {
  const { data } = await apiClient.post("/tasks", payload);
  return data;
}

export async function updateTask(id, payload) {
  const { data } = await apiClient.put(`/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id) {
  const { data } = await apiClient.delete(`/tasks/${id}`);
  return data;
}
