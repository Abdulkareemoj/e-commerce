import { create } from 'zustand';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';

export interface ConversationSummary {
  id: string;
  subject: string | null;
  lastMessage: { content: string; createdAt: string } | null;
  unread: number;
  updatedAt: string;
  // Vendor view
  buyer?: { id: string; name: string; image?: string | null };
  // User view
  vendor?: { id: string; storeName: string; name: string; image: string | null };
}

interface ConversationsState {
  conversations: ConversationSummary[];
  totalUnread: number;
  isLoading: boolean;
  error: string | null;
  pollingInterval: ReturnType<typeof setInterval> | null;

  fetchConversations: (role: 'vendor' | 'user') => Promise<void>;
  startPolling: (role: 'vendor' | 'user', intervalMs?: number) => void;
  stopPolling: () => void;
  markConversationRead: (conversationId: string) => void;
  reset: () => void;
}

export const useConversations = create<ConversationsState>()((set, get) => ({
  conversations: [],
  totalUnread: 0,
  isLoading: false,
  error: null,
  pollingInterval: null,

  fetchConversations: async (role) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ conversations: [], totalUnread: 0, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const endpoint = role === 'vendor' ? '/vendor/messaging' : '/user/messaging';
      const res = await api.get(endpoint);
      const convs: ConversationSummary[] = res.conversations || [];
      const unread = convs.reduce((sum: number, c: ConversationSummary) => sum + (c.unread || 0), 0);
      set({ conversations: convs, totalUnread: unread, isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch conversations:', err);
      set({ error: err.message || 'Failed to load conversations', isLoading: false });
    }
  },

  startPolling: (role, intervalMs = 10000) => {
    get().stopPolling();
    get().fetchConversations(role);
    const id = setInterval(() => get().fetchConversations(role), intervalMs);
    set({ pollingInterval: id });
  },

  stopPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null });
    }
  },

  markConversationRead: (conversationId) => {
    const { conversations } = get();
    const updated = conversations.map((c) => {
      if (c.id === conversationId && c.unread > 0) {
        return { ...c, unread: 0 };
      }
      return c;
    });
    const unread = updated.reduce((sum, c) => sum + (c.unread || 0), 0);
    set({ conversations: updated, totalUnread: unread });
  },

  reset: () => {
    get().stopPolling();
    set({ conversations: [], totalUnread: 0, isLoading: false, error: null });
  },
}));
