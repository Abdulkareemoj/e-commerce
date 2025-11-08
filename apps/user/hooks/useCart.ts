import { CartItem } from '@/types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Zustand Store Definition ---

interface CartState {
  cartItems: CartItem[];
  cartTotalCents: number;
  isLoading: boolean;
  addItem: (productId: string, qty: number, priceCents?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItemQuantity: (itemId: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

// Helper function to calculate total
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);
};

// Mock function to fetch product price (since we don't have a backend)
const getProductPrice = (productId: string): number => {
  // In a real app, this would be an API call or a lookup in a product cache.
  // For now, we'll use a mock price based on the ID.
  const basePrice = parseInt(productId.split('-')[1] || '100', 10) * 100;
  return basePrice; // Price in cents
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      cartTotalCents: 0,
      isLoading: true, // Set to true initially for persistence hydration

      addItem: async (productId, qty, priceCents) => {
        const { cartItems } = get();
        const existingItem = cartItems.find((item) => item.productId === productId);

        const finalPriceCents = priceCents || getProductPrice(productId);

        let newItems: CartItem[];
        if (existingItem) {
          // Update quantity of existing item
          newItems = cartItems.map((item) =>
            item.id === existingItem.id ? { ...item, qty: item.qty + qty } : item
          );
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `cart-${Date.now()}`, // Unique cart item ID
            productId,
            qty,
            priceCents: finalPriceCents,
            // variantId: 'default', // Add variant logic here if needed
          };
          newItems = [...cartItems, newItem];
        }

        set({
          cartItems: newItems,
          cartTotalCents: calculateTotal(newItems),
        });
      },

      removeItem: async (itemId) => {
        const newItems = get().cartItems.filter((item) => item.id !== itemId);
        set({
          cartItems: newItems,
          cartTotalCents: calculateTotal(newItems),
        });
      },

      updateItemQuantity: async (itemId, qty) => {
        const newItems = get().cartItems.map((item) =>
          item.id === itemId ? { ...item, qty } : item
        );
        set({
          cartItems: newItems,
          cartTotalCents: calculateTotal(newItems),
        });
      },

      clearCart: async () => {
        set({ cartItems: [], cartTotalCents: 0 });
      },
    }),
    {
      name: 'ecom-cart-storage', // unique name
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);
