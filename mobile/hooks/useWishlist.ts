import { Product } from '@/types';
import { create } from 'zustand';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';

interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  createdAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  wishlistedIds: Set<string>;

  loadWishlist: () => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlist = create<WishlistState>()((set, get) => ({
  items: [],
  isLoading: false,
  wishlistedIds: new Set(),

  loadWishlist: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      set({ items: [], wishlistedIds: new Set(), isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const res = await api.get('/user/wishlist');
      const items = res.items || [];
      set({
        items,
        wishlistedIds: new Set(items.map((i: WishlistItem) => i.productId)),
        isLoading: false,
      });
    } catch (err: any) {
      // Silently handle auth errors - session expiry handles the UI
      if (err.message?.includes('Session expired')) {
        set({ items: [], wishlistedIds: new Set(), isLoading: false });
      } else {
        console.error('Failed to load wishlist:', err);
        set({ isLoading: false });
      }
    }
  },

  toggle: async (productId) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;

    const { wishlistedIds } = get();
    const isAdding = !wishlistedIds.has(productId);

    try {
      if (isAdding) {
        await api.post(`/user/wishlist/${productId}`);
      } else {
        await api.delete(`/user/wishlist/${productId}`);
      }
      const newIds = new Set(wishlistedIds);
      if (isAdding) {
        newIds.add(productId);
      } else {
        newIds.delete(productId);
      }
      set({ wishlistedIds: newIds });
    } catch (err: any) {
      // Silently handle auth errors
      if (!err.message?.includes('Session expired')) {
        console.error('Failed to toggle wishlist:', err);
      }
    }
  },

  isWishlisted: (productId) => get().wishlistedIds.has(productId),
}));
