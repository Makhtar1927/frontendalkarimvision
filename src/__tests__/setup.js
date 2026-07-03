import '@testing-library/jest-dom';

// Mock import.meta.env
vi.stubGlobal('import', { meta: { env: { VITE_MOCK_MODE: 'true', VITE_API_URL: 'http://localhost:5000/api' } } });

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn(key => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.atob for JWT decoding
if (typeof window.atob === 'undefined') {
  window.atob = (str) => Buffer.from(str, 'base64').toString('binary');
}
if (typeof window.btoa === 'undefined') {
  window.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
}
