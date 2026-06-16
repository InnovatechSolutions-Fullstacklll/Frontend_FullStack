// src/Service/__tests__/authService.test.js
// Mock de la API
vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
globalThis.localStorage = localStorageMock;

describe('Auth Service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should login user successfully and store token', async () => {
      const { loginUser } = await import('../authService');
      const api = (await import('../api')).default;

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
        clave1: 'password123',
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-jwt-token');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on login failure', async () => {
      const { loginUser } = await import('../authService');
      const api = (await import('../api')).default;
      const mockError = new Error('Login failed');
      api.post.mockRejectedValue(mockError);

      await expect(loginUser('test@example.com', 'wrongpassword')).rejects.toThrow('Login failed');
    });
  });

  describe('registerUser', () => {
    it('should register user successfully', async () => {
      const { registerUser } = await import('../authService');
      const api = (await import('../api')).default;
      const userData = {
        nombre: 'New User',
        email: 'newuser@example.com',
        clave1: 'password123',
        clave2: 'password123',
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
      const { registerUser } = await import('../authService');
      const api = (await import('../api')).default;
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
      };

      const mockError = new Error('User already exists');
      api.post.mockRejectedValue(mockError);

      await expect(registerUser(userData)).rejects.toThrow('User already exists');
    });
  });

  describe('other methods', () => {
    it('getUserProfile should fetch profile data', async () => {
      const { getUserProfile } = await import('../authService')
      const api = (await import('../api')).default
      const mockResp = { data: { nombre: 'Juan', email: 'juan@example.com' } }
      api.get.mockResolvedValue(mockResp)

      const result = await getUserProfile()
      expect(api.get).toHaveBeenCalledWith('/api/user/profile')
      expect(result).toEqual(mockResp.data)
    })

    it('isAuthenticated and logout behavior', async () => {
      const { isAuthenticated, logout } = await import('../authService')
      localStorage.getItem.mockReturnValue('tok')
      expect(isAuthenticated()).toBe(true)

      logout()
      expect(localStorage.removeItem).toHaveBeenCalledWith('token')
    })

    it('isAuthenticated returns false when no token', async () => {
      const { isAuthenticated } = await import('../authService')
      localStorage.getItem.mockReturnValue(null)
      expect(isAuthenticated()).toBe(false)
    })

    it('loginUser does not store token if response has no token', async () => {
      const { loginUser } = await import('../authService')
      const api = (await import('../api')).default

      const mockResponse = { data: { user: { id: 1, email: 'notoken@example.com' } } }
      api.post.mockResolvedValue(mockResponse)

      const result = await loginUser('notoken@example.com', 'password')
      expect(api.post).toHaveBeenCalledWith('/api/login/auth', { email: 'notoken@example.com', clave1: 'password' })
      expect(localStorage.setItem).not.toHaveBeenCalled()
      expect(result).toEqual(mockResponse.data)
    })
  })
});
