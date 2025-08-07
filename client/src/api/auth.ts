import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

// 🚀 Attach JWT to all requests automatically
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: "ADMIN" | "INVENTORY_SUP" | "PICKING_SUP";
  warehouseId: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export function register(data: RegisterData) {
  return api.post<AuthResponse>("/auth/register", data).then((r) => r.data);
}

export function login(data: LoginData) {
  return api.post<AuthResponse>("/auth/login", data).then((r) => r.data);
}
