// src/Service/__tests__/config.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should use development API URL by default', async () => {
    // NODE_ENV no definido (default)
    delete process.env.NODE_ENV;

    // Re-importar para obtener el nuevo valor
    const { API_BASE_URL: apiUrl } = await import('../config');

    expect(apiUrl).toBe('http://localhost:8082');
  });

  it('should use development API URL when NODE_ENV is development', async () => {
    process.env.NODE_ENV = 'development';

    const { API_BASE_URL: apiUrl } = await import('../config');

    expect(apiUrl).toBe('http://localhost:8082');
  });

  it('should use production API URL when NODE_ENV is production', async () => {
    process.env.NODE_ENV = 'production';

    const { API_BASE_URL: apiUrl } = await import('../config');

    expect(apiUrl).toBe('https://tu-api-produccion.com');
  });

  it('should export API_BASE_URL', async () => {
    const { API_BASE_URL: apiUrl } = await import('../config');

    expect(apiUrl).toBeDefined();
    expect(typeof apiUrl).toBe('string');
  });
});