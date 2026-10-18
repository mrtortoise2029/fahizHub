import axios from "axios";

const api = axios.create({
  baseURL: "https://fahizhub.onrender.com/api",
  withCredentials: true
});

export default api;
