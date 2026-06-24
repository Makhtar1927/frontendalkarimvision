import { create } from 'zustand';

// Fonction utilitaire pour décoder un JWT de manière sécurisée (supporte les accents UTF-8)
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Ajout du padding '=' obligatoire pour éviter que la fonction atob() ne plante (DOMException)
    const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const jsonPayload = decodeURIComponent(
      window.atob(paddedBase64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// Vérifie la présence et la validité du token au premier chargement (SSR safe)
const checkInitialAuth = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return { token: null, isAuthenticated: false };
  }
  
  const token = localStorage.getItem('alkarimvision_token');
  if (!token) return { token: null, isAuthenticated: false };
  
  const payload = decodeJWT(token);
  // Si le token est invalide ou expiré (payload.exp est en secondes)
  if (!payload || payload.exp * 1000 < Date.now()) {
    localStorage.removeItem('alkarimvision_token');
    return { token: null, isAuthenticated: false };
  }
  return { token, isAuthenticated: true };
};

const initialState = checkInitialAuth();
const initialUser = (typeof window !== 'undefined' && initialState.token) ? decodeJWT(initialState.token) : null;

export const useAuthStore = create((set, get) => ({
  token: initialState.token,
  isAuthenticated: initialState.isAuthenticated,
  user: initialUser,
  
  login: (token) => {
    // On sauvegarde le token et on met à jour l'état avec l'utilisateur décodé
    const user = decodeJWT(token);
    localStorage.setItem('alkarimvision_token', token);
    set({ token, isAuthenticated: true, user });
  },
  
  logout: () => {
    // On supprime le token et on remet l'état à zéro
    localStorage.removeItem('alkarimvision_token');
    set({ token: null, isAuthenticated: false, user: null });
  },
}));