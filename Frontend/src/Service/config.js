// src/Service/config.js
const config = {
  development: {
    API_BASE_URL: "http://localhost:9090",
    REGISTER_SERVICE_URL: "http://localhost:9091",
    LOGIN_SERVICE_URL: "http://localhost:9092",
    ROLES_SERVICE_URL: "http://localhost:9093",
    PROJECTS_SERVICE_URL: "http://localhost:9094",
    METRICS_SERVICE_URL: "http://localhost:9095",
  },
  test: {
    API_BASE_URL: "http://localhost:9090",
    REGISTER_SERVICE_URL: "http://localhost:9091",
    LOGIN_SERVICE_URL: "http://localhost:9092",
    ROLES_SERVICE_URL: "http://localhost:9093",
    PROJECTS_SERVICE_URL: "http://localhost:9094",
    METRICS_SERVICE_URL: "http://localhost:9095",
  },
  production: {
    API_BASE_URL: "https://tu-api-produccion.com",
    REGISTER_SERVICE_URL: "https://tu-api-produccion.com",
    LOGIN_SERVICE_URL: "https://tu-api-produccion.com",
    ROLES_SERVICE_URL: "https://tu-api-produccion.com",
    PROJECTS_SERVICE_URL: "https://tu-api-produccion.com",
    METRICS_SERVICE_URL: "https://tu-api-produccion.com",
  },
};

// Determinar el entorno actual
const currentEnv = process.env.NODE_ENV || "development";
const activeConfig = config[currentEnv] || config.development;

export const API_BASE_URL = activeConfig.API_BASE_URL;
export const REGISTER_SERVICE_URL = activeConfig.REGISTER_SERVICE_URL;
export const LOGIN_SERVICE_URL = activeConfig.LOGIN_SERVICE_URL;
export const ROLES_SERVICE_URL = activeConfig.ROLES_SERVICE_URL;
export const PROJECTS_SERVICE_URL = activeConfig.PROJECTS_SERVICE_URL;
export const METRICS_SERVICE_URL = activeConfig.METRICS_SERVICE_URL;

export const API_ENDPOINTS = {
  register: "/api/register/user",
  login: "/api/login/auth",
  roles: "/api/roles",
  projects: "/api/projects",
  metrics: "/api/metrics",
};

export default config;
