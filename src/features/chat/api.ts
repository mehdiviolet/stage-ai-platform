// import { api } from "./client";

import { api } from "../../lib/api/client";

// ==================== AUTH ====================
export const authApi = {
  // POST /auth/register
  register: (payload: { email: string; password: string; fullName: string }) =>
    api.post("/auth/register", payload),

  // POST /auth/login
  login: (payload: { email: string; password: string }) =>
    api.post("/auth/login", payload),

  // GET /auth/me
  getProfile: () => api.get("/auth/me"),
};

// ==================== CONVERSATIONS ====================
export const conversationsApi = {
  // POST /conversations/create
  create: (payload: { name: string; model: string }) =>
    api.post("/conversations/create", payload),

  // GET /conversations
  getAll: () => api.get("/conversations"),

  // GET /conversations/{id}
  getById: (id: number) => api.get(`/conversations/${id}`),

  // DELETE /conversations/{id}
  delete: (id: number) => api.delete(`/conversations/${id}`),

  // POST /conversations/{id}/message
  sendMessage: (id: number, payload: { message: string; media?: Array<any> }) =>
    api.post(`/conversations/${id}/message`, payload),
};

// ==================== OLLAMA ====================
export const ollamaApi = {
  // GET /api/tags
  getModels: () => api.get("/api/tags"),
};
