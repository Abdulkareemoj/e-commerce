import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import { adminClient, emailOTPClient, usernameClient } from 'better-auth/client/plugins';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getDefaultAuthBaseUrl() {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000/api/auth';
  }

  const hostUri = Constants.expoConfig?.hostUri;
  const debuggerHost = (Constants as any).manifest?.debuggerHost as string | undefined;
  const host = (hostUri || debuggerHost)?.split(':')[0];

  return `http://${host || 'localhost'}:8000/api/auth`;
}

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_AUTH_URL || getDefaultAuthBaseUrl(),
  plugins: [
    expoClient({
      scheme: 'mobile',
      storagePrefix: 'mobile',
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
