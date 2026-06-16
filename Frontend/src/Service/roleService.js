import api from "./api";
import { API_ENDPOINTS } from "./config";

export const getRoles = () => api.get(API_ENDPOINTS.roles);

export const createRole = (roleData) =>
  api.post(API_ENDPOINTS.roles, roleData);
