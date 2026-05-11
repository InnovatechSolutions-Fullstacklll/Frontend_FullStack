// src/Service/__tests__/config.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { API_BASE_URL } from '../config';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should use development API URL by default', () => {
    // NODE_ENV no definido (default)
    delete process.env.NODE_ENV;

    // Re-importar para obtener el nuevo valor
    const { API_BASE_URL: apiUrl } = require('../config');

    expect(apiUrl).toBe('http://localhost:8080');
  });

  it('should use development API URL when NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development';

    const { API_BASE_URL: apiUrl } = require('../config');

    expect(apiUrl).toBe('http://localhost:8080');
  });

  it('should use production API URL when NODE_ENV is production', () => {
    process.env.NODE_ENV = 'production';

    const { API_BASE_URL: apiUrl } = require('../config');

    expect(apiUrl).toBe('https://tu-api-produccion.com');
  });

  it('should export API_BASE_URL', () => {
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe('string');
  });
});