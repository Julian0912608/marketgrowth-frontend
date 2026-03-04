// lib/store.ts — Global auth state with Zustand
import { create } from 'zustand';

interface AuthUser {
  userId:    string;
  email:     string;
  firstName: string;
  lastName:  string;
  planSlug:  string;
  role:      string;
}

interface AuthStore {
  user:         AuthUser | null;
  accessToken:  string | null;
  isAuth:       boolean;
  setAuth:      (user: AuthUser, token: string) => void;
  clearAuth:    () => void;
}

export const useAuthStore = create<AuthStore>(set => ({
  user:        null,
  accessToken: null,
  isAuth:      false,

  setAuth: (user, token) => {
    sessionStorage.setItem('access_token', token);
    set({ user, accessToken: token, isAuth: true });
  },

  clearAuth: () => {
    sessionStorage.removeItem('access_token');
    set({ user: null, accessToken: null, isAuth: false });
  },
}));
