import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const CART_KEY = 'localCart';

// --- Secure Storage (Tokens) ---

export async function saveTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function deleteTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

// --- General Storage (Cart, Cache) ---

export async function saveLocalCart(cartData: any) {
  await AsyncStorage.setItem(CART_KEY, JSON.stringify(cartData));
}

export async function getLocalCart(): Promise<any | null> {
  const data = await AsyncStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : null;
}

export async function deleteLocalCart() {
  await AsyncStorage.removeItem(CART_KEY);
}
