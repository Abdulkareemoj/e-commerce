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
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken?: string | null) => void;
  clearAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) => {
    set({
      user,
      accessToken: accessToken ?? null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  clearAuth: async () => {
    await signOut();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  refreshToken: async () => {
    const { data } = await getSession();
    if (data?.session?.token) {
      const token = data.session.token;
      set({ accessToken: token, user: data.user as User, isAuthenticated: true });
      return token;
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
    return null;
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const { data } = await getSession();
      if (data?.session && data?.user) {
        set({
          user: data.user as User,
          accessToken: (data.session as any)?.token ?? null,
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
