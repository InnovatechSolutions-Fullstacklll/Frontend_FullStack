// src/Service/__tests__/api.test.js
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
globalThis.localStorage = localStorageMock;

describe('API Configuration', () => {
  let mockAxiosInstance;
  let axios;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    axios = (await import('axios')).default;

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

  it('should create axios instance with correct configuration', async () => {
    const { default: apiModule } = await import('../api');

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: expect.any(String), // Se verifica en config.test.js
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    expect(apiModule).toBeDefined();
  });

  it('should have request interceptor configured', async () => {
    await import('../api');

    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
  });

  it('should have response interceptor configured', async () => {
    await import('../api');

    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
  });

  it('request interceptor should add Authorization header when token exists', async () => {
    // Simular token en localStorage
    localStorage.getItem.mockReturnValue('jwt-token-123')

    await import('../api')

    // Capturar la función pasada a interceptors.request.use
    const requestUseCalls = mockAxiosInstance.interceptors.request.use.mock.calls
    const requestFulfilled = requestUseCalls[0][0]

    const config = { headers: {} }
    const result = requestFulfilled(config)

    expect(result.headers.Authorization).toBe('Bearer jwt-token-123')
  })

  it('request interceptor should return config when no token exists', async () => {
    localStorage.getItem.mockReturnValue(null)

    await import('../api')

    const requestUseCalls = mockAxiosInstance.interceptors.request.use.mock.calls
    const requestFulfilled = requestUseCalls[0][0]

    const config = { headers: {} }
    const result = requestFulfilled(config)

    expect(result).toBe(config)
    expect(config.headers.Authorization).toBeUndefined()
  })

  it('response interceptor should handle 401, 403 and 5xx errors', async () => {
    await import('../api')

    const responseUseCalls = mockAxiosInstance.interceptors.response.use.mock.calls
    // La función rechazada es el segundo argumento
    const responseRejected = responseUseCalls[0][1]

    // Caso 401 -> token removido
    const err401 = { response: { status: 401 } }
    await expect(() => responseRejected(err401)).rejects.toEqual(err401)
    expect(localStorage.removeItem).toHaveBeenCalledWith('token')

    // Caso 403 -> console.error llamado con 'Acceso denegado'
    const spyConsole = vi.spyOn(console, 'error').mockImplementation(() => {})
    const err403 = { response: { status: 403 } }
    await expect(() => responseRejected(err403)).rejects.toEqual(err403)
    expect(spyConsole).toHaveBeenCalledWith('Acceso denegado')
    spyConsole.mockRestore()

    // Caso 500 -> console.error llamado con 'Error del servidor'
    const spyConsole2 = vi.spyOn(console, 'error').mockImplementation(() => {})
    const err500 = { response: { status: 500 } }
    await expect(() => responseRejected(err500)).rejects.toEqual(err500)
    expect(spyConsole2).toHaveBeenCalledWith('Error del servidor')
    spyConsole2.mockRestore()
  })

  it('response interceptor returns response unchanged on success', async () => {
    await import('../api')

    const responseUseCalls = mockAxiosInstance.interceptors.response.use.mock.calls
    const responseFulfilled = responseUseCalls[0][0]
    const response = { data: 'ok' }

    expect(responseFulfilled(response)).toBe(response)
  })

  it('request interceptor rejects errors during request setup', async () => {
    await import('../api')

    const requestUseCalls = mockAxiosInstance.interceptors.request.use.mock.calls
    const requestRejected = requestUseCalls[0][1]
    const error = new Error('request failed')

    await expect(() => requestRejected(error)).rejects.toThrow('request failed')
  })
});
