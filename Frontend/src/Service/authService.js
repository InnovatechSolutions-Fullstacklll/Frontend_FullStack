// src/Service/authService.js
import api from "./api"; // Usar la configuración centralizada
import { API_ENDPOINTS } from "./config";

// Función de login
export const loginUser = async (email, clave1) => {
    const response = await api.post('/api/login/auth', { email, clave1 });

  // Si el login es exitoso, guardar el token
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  return response.data;
};

// Función de registro
export const registerUser = async (userData) => {
    const response = await api.post('/api/register/user', userData);
    return response.data;
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token; // Retorna true si existe un token
};

// Función para cerrar sesión
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Función para obtener el perfil del usuario (si tienes un endpoint)
export const getUserProfile = async () => {
  const response = await api.get("/api/user/profile");
  return response.data;
};
