import axios from 'axios';
import { API_BASE_URL } from './config';

// Configuración centralizada de la API
const api = axios.create({
  baseURL: API_BASE_URL, // URL del Gateway/BFF
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores globales
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejo centralizado de errores
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      // Podrías redirigir al login aquí
      // window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      console.error('Acceso denegado');
    }

    if (error.response?.status >= 500) {
      console.error('Error del servidor');
    }

    return Promise.reject(error);
  }
);

export default api;