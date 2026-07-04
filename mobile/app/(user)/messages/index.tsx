import React, { useEffect } from 'react';
import { Text } from '@/components/ui/text';
import { ChatListItem } from '@/components/messages/ChatListItem';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter } from 'expo-router';
import { useConversations } from '@/hooks/useConversations';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuthStore } from '@/lib/authStore';

export default function UserMessagesScreen() {
  const router = useRouter();
  const { conversations, isLoading, fetchConversations } = useConversations();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    useConversations.getState().startPolling('user', 10000);
    return () => useConversations.getState().stopPolling();
  }, [isAuthenticated]);

  return (
    <AuthGuard
      icon={MessageSquare}
      message="Sign in as a buyer to view your messages."
      requiredRole="user"
      roleMessage="Only buyers can access messages.">
      <SafeAreaView className="bg-background flex-1" edges={['top']}>
        <View className="border-border/50 border-b px-4 py-3">
          <Text variant="h3" className="font-bold">
            Messages
          </Text>
        </View>
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={() => fetchConversations('user')} />
          }>
          {conversations.length === 0 ? (
            <View className="mt-20 items-center gap-2">
              <Icon as={MessageSquare} size={32} className="text-muted-foreground" />
              <Text className="text-muted-foreground">No conversations yet.</Text>
            </View>
          ) : (
            conversations.map((conv) => (
              <ChatListItem
                key={conv.id}
                name={conv.vendor?.name || conv.vendor?.storeName || 'Unknown Store'}
                subtitle={conv.subject || conv.vendor?.storeName || undefined}
                lastMessage={conv.lastMessage?.content || null}
                timestamp={conv.updatedAt}
                unread={conv.unread}
                avatarUrl={conv.vendor?.image || null}
                icon="store"
                onPress={() => {
                  useConversations.getState().markConversationRead(conv.id);
                  router.push(`/messages/${conv.id}` as any);
                }}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </AuthGuard>
  );
}
