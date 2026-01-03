import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import { adminClient, emailOTPClient, usernameClient } from 'better-auth/client/plugins';
import * as SecureStore from 'expo-secure-store';

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  plugins: [
    expoClient({
      scheme: 'user',
      storagePrefix: 'user',
      storage: SecureStore,
    }),
    adminClient(),
    emailOTPClient(),
    usernameClient(),
  ],
});

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  getSession,
  forgetPassword,
  resetPassword,
  isUsernameAvailable,
  sendVerificationEmail,
  requestPasswordReset,
} = authClient;
