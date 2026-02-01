import { create } from 'zustand';
import { getSession, signOut } from './auth-client';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
  image?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken?: string | null, refreshToken?: string | null) => void;
  clearAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken, refreshToken) => {
    set({
      user,
      accessToken: accessToken ?? null,
      refreshToken: refreshToken ?? null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  clearAuth: async () => {
    await signOut();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setAccessToken: (token: string) => {
    set({ accessToken: token });
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const { data } = await getSession();
      if (data?.session && data?.user) {
        set({
          user: data.user as User,
          accessToken: (data.session as any)?.token ?? null,
          refreshToken: null,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
