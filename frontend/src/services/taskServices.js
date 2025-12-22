import axios from "axios";

// Use relative path – handled by Nginx proxy
const api = axios.create({
  baseURL: "/api/tasks",
});

export function getTasks() {
  return api.get("/");
}

export function addTask(task) {
  return api.post("/", task);
}

export function updateTask(id, task) {
  return api.put(`/${id}`, task);
}

export function deleteTask(id) {
  return api.delete(`/${id}`);
}
