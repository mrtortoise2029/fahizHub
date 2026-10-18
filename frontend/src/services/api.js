import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.DEV
    ? import.meta.env.VITE_API_URL || "http://localhost:3000/api"
    : "/api",
  withCredentials: true,
});

export default api;
