import axios from "axios";

export const api = axios.create({
  // baseURL: "https://localhost:9999",
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
