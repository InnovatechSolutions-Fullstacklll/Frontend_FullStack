// src/Service/config.js
const config = {
  development: {
    API_BASE_URL: 'http://localhost:8080',
  },
  production: {
    API_BASE_URL: 'https://tu-api-produccion.com',
  },
};

// Determinar el entorno actual
const currentEnv = process.env.NODE_ENV || 'development';

export const API_BASE_URL = config[currentEnv].API_BASE_URL;
export default config;