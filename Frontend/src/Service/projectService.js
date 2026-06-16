import api from "./api";
import { API_ENDPOINTS } from "./config";

export const getProjects = () => api.get(API_ENDPOINTS.projects);

export const createProject = (projectData) => {
  api.post(API_ENDPOINTS.projects, projectData);
  console.log(API_ENDPOINTS.projects, projectData);
};
