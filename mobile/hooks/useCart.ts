import { CartItem, AppliedCoupon } from '@/types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';

export interface HydratedCartItem extends CartItem {
  title?: string;
  image?: string;
  variantName?: string;
}

export interface CouponState {
  coupon: AppliedCoupon | null;
  couponLoading: boolean;
  couponError: string | null;
  validateCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
}

interface CartState {
  cartItems: HydratedCartItem[];
  cartTotalCents: number;
  totalItems: number;
  isLoading: boolean;
  sessionToken: string | null;
  coupon: AppliedCoupon | null;
  couponLoading: boolean;
  couponError: string | null;

  addItem: (
    productId: string,
    qty: number,
    priceCents?: number,
    variantId?: string
  ) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItemQuantity: (itemId: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
  validateCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
}

const calculateSubtotal = (items: HydratedCartItem[]): number => {
  return items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);
};

function getSessionHeaders(token: string | null): Record<string, string> {
  if (!token) return {};
  return { 'X-Session-Token': token };
}

function generateId(): string {
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      cartTotalCents: 0,
      totalItems: 0,
      isLoading: true,
      sessionToken: null,
      coupon: null,
      couponLoading: false,
      couponError: null,

      loadCart: async () => {
        const { sessionToken } = get();
        const { user, isAuthenticated } = useAuthStore.getState();

        // For authenticated users, skip if not authenticated
        if (user && !isAuthenticated) {
          set({ isLoading: false });
          return;
        }

        // For guests, skip if no session token
        if (!user && !sessionToken) {
          set({ isLoading: false });
          return;
        }

        try {
          const res = user
            ? await api.get('/cart')
            : await api.publicGet('/cart', {
                headers: getSessionHeaders(sessionToken) as any,
              });
          if (res?.items) {
            const items: HydratedCartItem[] = res.items.map((i: any) => ({
              id: i.id,
              productId: i.productId,
              variantId: i.variantId,
              qty: i.quantity,
              priceCents: i.priceCents,
              title: i.title,
              image: i.image,
            }));
            set({
              cartItems: items,
              cartTotalCents: calculateSubtotal(items),
              totalItems: items.reduce((sum, item) => sum + item.qty, 0),
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (err: any) {
          // Silently handle auth errors - session expiry handles the UI
          if (err.message?.includes('Session expired')) {
            set({ isLoading: false });
          } else {
            console.error('Failed to load cart:', err);
            set({ isLoading: false });
          }
        }
      },

      addItem: async (productId, qty, priceCents, variantId) => {
        const { sessionToken } = get();
        let token = sessionToken;
        if (!token) {
          token = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
          set({ sessionToken: token });
        }

        const { user, isAuthenticated } = useAuthStore.getState();

        try {
          if (user && isAuthenticated) {
            await api.post('/cart/add', { productId, variantId, quantity: qty, priceCents });
          } else {
            await api.publicPost(
              '/cart/add',
              { productId, variantId, quantity: qty, priceCents },
              {
                headers: getSessionHeaders(token) as any,
              }
            );
          }

          await get().loadCart();
        } catch (err: any) {
          if (!err.message?.includes('Session expired')) {
            console.error('Failed to add item to cart:', err);
          }
        }
      },

      removeItem: async (itemId) => {
        const { sessionToken } = get();
        const { user, isAuthenticated } = useAuthStore.getState();

        try {
          if (user && isAuthenticated) {
            await api.delete(`/cart/item/${itemId}`);
          } else {
            await api.publicRequest(`/cart/item/${itemId}`, {
              method: 'DELETE',
              headers: getSessionHeaders(sessionToken) as any,
            });
          }
          await get().loadCart();
        } catch (err: any) {
          if (!err.message?.includes('Session expired')) {
            console.error('Failed to remove item:', err);
          }
        }
      },

      updateItemQuantity: async (itemId, qty) => {
        const { sessionToken } = get();
        const { user, isAuthenticated } = useAuthStore.getState();

        try {
          if (qty < 1) {
            await get().removeItem(itemId);
            return;
          }

          if (user && isAuthenticated) {
            await api.put(`/cart/item/${itemId}`, { quantity: qty });
          } else {
            await api.publicRequest(`/cart/item/${itemId}`, {
              method: 'PUT',
              body: { quantity: qty },
              headers: getSessionHeaders(sessionToken) as any,
            });
          }
          await get().loadCart();
        } catch (err: any) {
          if (!err.message?.includes('Session expired')) {
            console.error('Failed to update quantity:', err);
          }
        }
      },

      clearCart: async () => {
        const { sessionToken } = get();
        const { user, isAuthenticated } = useAuthStore.getState();

        try {
          if (user && isAuthenticated) {
            await api.delete('/cart/clear');
          } else {
            await api.publicRequest('/cart/clear', {
              method: 'DELETE',
              headers: getSessionHeaders(sessionToken) as any,
            });
          }
          set({ cartItems: [], cartTotalCents: 0, totalItems: 0 });
        } catch (err: any) {
          if (!err.message?.includes('Session expired')) {
            console.error('Failed to clear cart:', err);
          }
        }
      },

      mergeGuestCart: async () => {
        const { sessionToken } = get();
        if (!sessionToken) return;

        try {
          await api.post('/cart/merge', { sessionToken });
          set({ sessionToken: null });
          await get().loadCart();
        } catch (err: any) {
          if (!err.message?.includes('Session expired')) {
            console.error('Failed to merge cart:', err);
          }
        }
      },

      validateCoupon: async (code) => {
        const { cartItems } = get();
        set({ couponLoading: true, couponError: null });

        try {
          const subtotalCents = calculateSubtotal(cartItems);
          const res = await api.publicGet(
            `/coupons/validate?code=${encodeURIComponent(code)}&subtotalCents=${subtotalCents}`
          );

          if (res.valid) {
            set({ coupon: res.coupon, couponLoading: false, couponError: null });
          } else {
            set({ coupon: null, couponLoading: false, couponError: res.error || 'Invalid coupon' });
          }
        } catch (err: any) {
          set({
            coupon: null,
            couponLoading: false,
            couponError: err.message || 'Failed to validate coupon',
          });
        }
      },

      removeCoupon: () => {
        set({ coupon: null, couponLoading: false, couponError: null });
      },
    }),
    {
      name: 'ecom-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessionToken: state.sessionToken,
        cartItems: state.cartItems,
        cartTotalCents: state.cartTotalCents,
        coupon: state.coupon,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);
