import { useLocalSearchParams, useRouter } from 'expo-router';
import { ConversationView } from '@/components/messages/ConversationView';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useConversations } from '@/hooks/useConversations';

export default function VendorConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [header, setHeader] = useState<{
    name: string;
    subtitle?: string;
    avatarUrl?: string | null;
    icon: 'user';
  }>();

  useEffect(() => {
    useConversations.getState().markConversationRead(id || '');
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api.get(`/vendor/messaging/${id}`).then((res) => {
      const conv = res.conversation;
      if (conv?.user) {
        setHeader({
          name: conv.user.name || 'Unknown Buyer',
          subtitle: conv.subject || undefined,
          avatarUrl: conv.user.image || null,
          icon: 'user',
        });
      }
    }).catch(console.error);
  }, [id]);

  if (!id) return null;

  return (
    <ConversationView
      conversationId={id}
      isVendor
      header={header}
      onBack={() => router.back()}
    />
  );
}
