// src/Service/__tests__/authService.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser, registerUser } from '../authService';
import api from '../api';

// Mock de la API
vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
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

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should login user successfully and store token', async () => {
      const mockResponse = {
        data: {
          token: 'fake-jwt-token',
          user: { id: 1, email: 'test@example.com' },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await loginUser('test@example.com', 'password123');

      expect(api.post).toHaveBeenCalledWith('/api/login/auth', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-jwt-token');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on login failure', async () => {
      const mockError = new Error('Login failed');
      api.post.mockRejectedValue(mockError);

      await expect(loginUser('test@example.com', 'wrongpassword')).rejects.toThrow('Login failed');
    });
  });

  describe('registerUser', () => {
    it('should register user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      const mockResponse = {
        data: {
          message: 'User registered successfully',
          user: { id: 2, email: 'newuser@example.com' },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await registerUser(userData);

      expect(api.post).toHaveBeenCalledWith('/api/register/user', userData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on registration failure', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
      };

      const mockError = new Error('User already exists');
      api.post.mockRejectedValue(mockError);

      await expect(registerUser(userData)).rejects.toThrow('User already exists');
    });
  });
});