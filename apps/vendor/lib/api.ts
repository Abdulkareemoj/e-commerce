import { getAccessToken, saveTokens, deleteTokens, getRefreshToken } from './storage';
import { useAuthStore } from './authStore'; // Import the auth store

// NOTE: EXPO_PUBLIC_API_BASE_URL must be set in .env file for web/native builds
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
  body?: any;
}

async function fetchWithAuth(endpoint: string, options: ApiRequestOptions = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    // Explicitly define headers as a Record
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>), // Cast options.headers
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

  // Handle 401 Unauthorized - attempt token refresh
  if (response.status === 401 && options.auth) {
    const refreshToken = useAuthStore.getState().refreshToken; // Get refresh token from store
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const { user, accessToken, refreshToken: newRefreshToken } = data; // Assuming refresh endpoint returns user and new tokens
          useAuthStore.getState().setAuth(user, accessToken, newRefreshToken); // Update store
          await saveTokens(accessToken, newRefreshToken); // Save new tokens to SecureStore

          // Retry the original request with the new token
          headers['Authorization'] = `Bearer ${accessToken}`;
          config.headers = headers; // Ensure config.headers is updated with new Authorization
          response = await fetch(url, config);
        } else {
          // Refresh failed, force logout
          useAuthStore.getState().clearAuth(); // Clear auth state in store
          await deleteTokens(); // Clear tokens from SecureStore
          throw new Error('Session expired. Please log in again.');
        }
      } catch (error) {
        // If refresh fails or network error occurs during refresh
        useAuthStore.getState().clearAuth(); // Clear auth state in store
        await deleteTokens(); // Clear tokens from SecureStore
        throw new Error('Session expired. Please log in again.');
      }
    } else {
      // No refresh token available, force logout
      useAuthStore.getState().clearAuth(); // Clear auth state in store
      await deleteTokens(); // Clear tokens from SecureStore
      throw new Error('Authentication required.');
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
  patch: (endpoint: string, body: any, options?: ApiRequestOptions) =>
    fetchWithAuth(endpoint, { ...options, method: 'PATCH', body, auth: true }),
  delete: (endpoint: string, options?: ApiRequestOptions) =>
    fetchWithAuth(endpoint, { ...options, method: 'DELETE', auth: true }),
  // Public methods (no auth required)
  publicPost: (endpoint: string, body: any, options?: ApiRequestOptions) =>
    fetchWithAuth(endpoint, { ...options, method: 'POST', body, auth: false }),
  publicGet: (endpoint: string, options?: ApiRequestOptions) =>
    fetchWithAuth(endpoint, { ...options, method: 'GET', auth: false }),
};
