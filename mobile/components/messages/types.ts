export interface ConversationItem {
  id: string;
  subject: string | null;
  lastMessage: { content: string; createdAt: string } | null;
  unread: number;
  createdAt: string;
  updatedAt: string;
}

export interface VendorConversationItem extends ConversationItem {
  buyer: { id: string; name: string; email?: string; image?: string | null };
}

export interface UserConversationItem extends ConversationItem {
  vendor: {
    id: string;
    storeName: string;
    storeSlug: string;
    name: string;
    image: string | null;
  };
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: { id: string; name: string; image?: string | null };
}

export interface ConversationDetail {
  id: string;
  vendorId?: string;
  userId?: string;
  subject: string | null;
  messages: MessageItem[];
  createdAt: string;
  updatedAt: string;
}
