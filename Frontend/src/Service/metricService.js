import api from "./api";
import { API_ENDPOINTS } from "./config";

export const getMetrics = () => api.get(API_ENDPOINTS.metrics);

export const createMetric = (metricData) =>
  api.post(API_ENDPOINTS.metrics, metricData);
