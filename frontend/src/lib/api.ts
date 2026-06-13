import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // We could trigger a toast here if we want, or handle 401s to force logout
    if (error.response?.status === 401) {
      // Clear token and maybe redirect to login
      localStorage.removeItem("auth_token");
      // Avoid circular dependency with router here, handle in UI components
    }
    return Promise.reject(error);
  }
);
