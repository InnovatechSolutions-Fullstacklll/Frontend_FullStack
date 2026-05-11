// src/Service/__tests__/api.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import api from '../api';

// Mock de axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(),
  },
}));

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe('API Configuration', () => {
  let mockAxiosInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock del instance de axios
    mockAxiosInstance = {
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    };

    axios.create.mockReturnValue(mockAxiosInstance);
  });

  it('should create axios instance with correct configuration', () => {
    // Re-importar para activar el mock
    vi.resetModules();
    require('../api');

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: expect.any(String), // Se verifica en config.test.js
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  });

  it('should have request interceptor configured', () => {
    vi.resetModules();
    require('../api');

    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
  });

  it('should have response interceptor configured', () => {
    vi.resetModules();
    require('../api');

    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
  });
});