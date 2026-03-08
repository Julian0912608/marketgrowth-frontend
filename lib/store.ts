// lib/store.ts — Global auth state with Zustand + localStorage persistence
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  updateUser:   (updates: Partial<AuthUser>) => void;
  clearAuth:    () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user:        null,
      accessToken: null,
      isAuth:      false,

      setAuth: (user, token) => {
        // Bewaar token ook in sessionStorage voor de axios interceptor
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('access_token', token);
        }
        set({ user, accessToken: token, isAuth: true });
      },

      // Update alleen user velden — token blijft intact
      updateUser: (updates) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...updates } });
        }
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('access_token');
        }
        set({ user: null, accessToken: null, isAuth: false });
      },
    }),
    {
      name: 'mg-auth',           // localStorage key
      partialize: (state) => ({  // sla ALLEEN user op, niet de token
        user:    state.user,
        isAuth:  state.isAuth,
        // accessToken bewust weggelaten — token leeft in sessionStorage
      }),
      onRehydrateStorage: () => (state) => {
        // Na rehydration: herstel accessToken uit sessionStorage
        if (typeof window !== 'undefined' && state) {
          const token = sessionStorage.getItem('access_token');
          if (token) {
            state.accessToken = token;
          } else {
            // Geen token meer — zet isAuth op false
            state.isAuth  = false;
            state.user    = null;
          }
        }
      },
    }
  )
);
