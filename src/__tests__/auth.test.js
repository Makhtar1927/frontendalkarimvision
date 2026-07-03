import { describe, it, expect, beforeEach, vi } from 'vitest';

// ============================================================
// TEST UNITAIRE : Authentification (Auth Store)
// ============================================================

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const jsonPayload = decodeURIComponent(
      atob(paddedBase64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const createAuthStore = () => {
  let state = { token: null, isAuthenticated: false, user: null };
  
  return {
    getState: () => state,
    login: (token) => {
      const user = decodeJWT(token);
      localStorage.setItem('alkarimvision_token', token);
      state = { token, isAuthenticated: true, user };
    },
    logout: () => {
      localStorage.removeItem('alkarimvision_token');
      state = { token: null, isAuthenticated: false, user: null };
    },
    checkToken: (token) => {
      if (!token) return false;
      const payload = decodeJWT(token);
      if (!payload || payload.exp * 1000 < Date.now()) return false;
      return true;
    }
  };
};

// Helper pour créer un faux JWT
const createMockJWT = (payload) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fakesignature`;
};

describe('🔐 Tests Unitaires : Authentification (Auth Store)', () => {
  let store;
  
  beforeEach(() => {
    localStorage.clear();
    store = createAuthStore();
  });

  it('devrait initialiser un état non authentifié', () => {
    const state = store.getState();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('devrait se connecter avec un token JWT valide', () => {
    const token = createMockJWT({
      id: 1,
      role: 'admin',
      full_name: 'Admin Al Karim',
      exp: Math.floor((Date.now() + 86400000) / 1000) // +24h
    });
    
    store.login(token);
    const state = store.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user.role).toBe('admin');
    expect(state.user.full_name).toBe('Admin Al Karim');
  });

  it('devrait sauvegarder le token dans localStorage', () => {
    const token = createMockJWT({ id: 1, exp: Math.floor((Date.now() + 86400000) / 1000) });
    store.login(token);
    expect(localStorage.setItem).toHaveBeenCalledWith('alkarimvision_token', token);
  });

  it('devrait se déconnecter correctement', () => {
    const token = createMockJWT({ id: 1, exp: Math.floor((Date.now() + 86400000) / 1000) });
    store.login(token);
    store.logout();
    const state = store.getState();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('alkarimvision_token');
  });

  it('devrait rejeter un token expiré', () => {
    const expiredToken = createMockJWT({
      id: 1,
      exp: Math.floor((Date.now() - 3600000) / 1000) // -1h (expiré)
    });
    expect(store.checkToken(expiredToken)).toBe(false);
  });

  it('devrait accepter un token valide (non expiré)', () => {
    const validToken = createMockJWT({
      id: 1,
      exp: Math.floor((Date.now() + 3600000) / 1000) // +1h
    });
    expect(store.checkToken(validToken)).toBe(true);
  });

  it('devrait rejeter un token malformé', () => {
    expect(store.checkToken('not.a.valid.jwt')).toBe(false);
    expect(store.checkToken('')).toBe(false);
    expect(store.checkToken(null)).toBe(false);
    expect(store.checkToken(undefined)).toBe(false);
  });

  it('devrait décoder le payload JWT correctement', () => {
    const payload = { id: 42, role: 'admin', full_name: 'Test User', exp: 9999999999 };
    const token = createMockJWT(payload);
    const decoded = decodeJWT(token);
    expect(decoded.id).toBe(42);
    expect(decoded.role).toBe('admin');
    expect(decoded.full_name).toBe('Test User');
  });
});
