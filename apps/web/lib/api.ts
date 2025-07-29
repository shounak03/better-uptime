import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/api/v1/login", { email, password });
    return response.data;
  },
  register: async (name: string, email: string, password: string) => {
    const response = await api.post("/api/v1/register", { name, email, password });
    return response.data;
  },
};

// Website API
export const websiteAPI = {
  addWebsite: async (name: string, url: string) => {
    const response = await api.post("/api/v1/addWebsite", { name, url });
    return response.data;
  },
  getStatus: async (websiteId: string) => {
    const response = await api.get(`/api/v1/status/${websiteId}`);
    return response.data;
  },
};

export default api; 