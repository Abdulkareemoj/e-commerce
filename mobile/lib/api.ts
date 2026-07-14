import { useAuthStore, emitSessionExpired } from './authStore';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Track if we've already emitted an event to avoid duplicates
let sessionExpiredEmitted = false;

function resetSessionExpiredFlag() {
  sessionExpiredEmitted = false;
}

// Reset flag when auth state changes
useAuthStore.subscribe((state, prev) => {
  if (state.isAuthenticated && !prev.isAuthenticated) {
    resetSessionExpiredFlag();
  }
});

function getDefaultApiBaseUrl() {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000/api';
  }

  const hostUri = Constants.expoConfig?.hostUri;
  const debuggerHost = (Constants as any).manifest?.debuggerHost as string | undefined;
  const host = (hostUri || debuggerHost)?.split(':')[0];

  return `http://${host || 'localhost'}:8000/api`;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || getDefaultApiBaseUrl();

interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
  body?: any;
}

async function fetchWithAuth(endpoint: string, options: ApiRequestOptions = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const currentAccessToken = useAuthStore.getState().accessToken;
  if (options.auth && currentAccessToken) {
    headers['Authorization'] = `Bearer ${currentAccessToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : options.body,
  };

  let response = await fetch(url, config);

  // Handle 401 Unauthorized — attempt session refresh via Better Auth
  if (response.status === 401 && options.auth) {
    const token = await useAuthStore.getState().refreshToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      config.headers = headers;
      response = await fetch(url, config);
    } else {
      useAuthStore.getState().clearAuth();
      // Emit event only once per session expiry
      if (!sessionExpiredEmitted) {
        sessionExpiredEmitted = true;
        emitSessionExpired();
      }
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText || 'An unknown error occurred.' };
    }
    throw new Error(errorData.message || 'API request failed.');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  get: (endpoint: string, options?: ApiRequestOptions) =>
    fetchWithAuth(endpoint, { ...options, method: 'GET', auth: true }),
  post: (endpoint: string, body: any, options?: ApiRequestOptions) =>
    fetchWithAuth(endpoint, { ...options, method: 'POST', body, auth: true }),
  put: (endpoint: string, body: any, options?: ApiRequestOptions) =>
    fetchWithAuth(endpoint, { ...options, method: 'PUT', body, auth: true }),
  patch: (endpoint: string, body: any, options?: ApiRequestOptions) =>
    fetchWithAuth(endpoint, { ...options, method: 'PATCH', body, auth: true }),
  delete: (endpoint: string, options?: ApiRequestOptions) =>
    fetchWithAuth(endpoint, { ...options, method: 'DELETE', auth: true }),
  publicPost: (endpoint: string, body: any, options?: ApiRequestOptions) =>
    fetchWithAuth(endpoint, { ...options, method: 'POST', body, auth: false }),
  publicGet: (endpoint: string, options?: ApiRequestOptions) =>
    fetchWithAuth(endpoint, { ...options, method: 'GET', auth: false }),
  publicPut: (endpoint: string, body: any, options?: ApiRequestOptions) =>
    fetchWithAuth(endpoint, { ...options, method: 'PUT', body, auth: false }),
  publicDelete: (endpoint: string, options?: ApiRequestOptions) =>
    fetchWithAuth(endpoint, { ...options, method: 'DELETE', auth: false }),
  publicRequest: (endpoint: string, options?: ApiRequestOptions) =>
    fetchWithAuth(endpoint, { ...options, auth: false }),
};

export async function uploadFile(
  uri: string,
  fileName: string,
  contentType: string,
  purpose: 'product' | 'variant' | 'avatar' | 'message' | 'general' = 'general',
): Promise<string> {
  const fileResponse = await fetch(uri);
  const blob = await fileResponse.blob();

  const { uploadUrl, publicUrl } = await api.post('/upload/init', {
    fileName,
    contentType,
    fileSize: blob.size,
    purpose,
  });

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': contentType },
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload file to storage');
  }

  return publicUrl;
}
