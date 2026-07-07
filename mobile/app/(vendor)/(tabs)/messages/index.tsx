import React, { useEffect } from 'react';
import { Text } from '@/components/ui/text';
import { ChatListItem } from '@/components/messages/ChatListItem';
import { View, ScrollView, RefreshControl } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter } from 'expo-router';
import { useConversations } from '@/hooks/useConversations';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuthStore } from '@/lib/authStore';

export default function VendorMessagesScreen() {
  const router = useRouter();
  const { conversations, isLoading, fetchConversations } = useConversations();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    useConversations.getState().startPolling('vendor', 10000);
    return () => useConversations.getState().stopPolling();
  }, [isAuthenticated]);

  return (
    <AuthGuard
      icon={MessageSquare}
      message="Sign in as a vendor to view your messages."
      requiredRole="vendor"
      roleMessage="Only vendors can access messages.">
      <View className="bg-background flex-1">
        <View className="bg-card border-border items-center justify-center border-b px-5 py-4">
          <Text className="text-foreground text-lg font-bold">Messages</Text>
        </View>
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={() => fetchConversations('vendor')} />
          }>
          {conversations.length === 0 ? (
            <View className="mt-20 items-center gap-3">
              <View className="bg-muted size-16 items-center justify-center rounded-full">
                <Icon as={MessageSquare} size={32} className="text-muted-foreground" />
              </View>
              <Text className="text-muted-foreground">No conversations yet</Text>
            </View>
          ) : (
            conversations.map((conv) => (
              <ChatListItem
                key={conv.id}
                name={conv.buyer?.name || 'Unknown'}
                subtitle={conv.subject || undefined}
                lastMessage={conv.lastMessage?.content || null}
                timestamp={conv.updatedAt}
                unread={conv.unread}
                avatarUrl={conv.buyer?.image || null}
                icon="user"
                onPress={() => {
                  useConversations.getState().markConversationRead(conv.id);
                  router.push(`/messages/${conv.id}` as any);
                }}
              />
            ))
          )}
        </ScrollView>
      </View>
    </AuthGuard>
  );
}
