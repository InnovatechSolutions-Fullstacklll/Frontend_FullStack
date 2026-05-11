// src/Service/config.js
const config = {
  development: {
    API_BASE_URL: 'http://localhost:8082',
  },
  test: {
    API_BASE_URL: 'http://localhost:8082',
  },
  production: {
    API_BASE_URL: 'https://tu-api-produccion.com',
  },
};

// Determinar el entorno actual
const currentEnv = process.env.NODE_ENV || 'development';
const activeConfig = config[currentEnv] || config.development;

export const API_BASE_URL = activeConfig.API_BASE_URL;
export default config;