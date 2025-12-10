import { create } from 'zustand';
import { getAccessToken, getRefreshToken, deleteTokens } from './storage';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  setAuth: (user, accessToken, refreshToken) => {
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  clearAuth: () => {
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    deleteTokens(); // Clear tokens from SecureStore on logout
  },

  setAccessToken: (token: string) => {
    set({ accessToken: token });
  },

  initializeAuth: async () => {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    if (accessToken && refreshToken) {
      // In a real app, you might want to verify the accessToken with the backend
      // or decode it to get user info without a full API call here.
      // For now, we'll assume the presence of tokens means authenticated.
      // A more robust solution would fetch user profile on app start.
      set({ accessToken, refreshToken, isAuthenticated: true });
    } else {
      set({ isAuthenticated: false });
    }
  },
}));
