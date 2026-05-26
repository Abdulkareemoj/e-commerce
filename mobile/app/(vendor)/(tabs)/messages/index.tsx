import React, { useEffect } from 'react';
import { Text } from '@/components/ui/text';
import { ChatListItem } from '@/components/messages/ChatListItem';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter } from 'expo-router';
import { useConversations } from '@/hooks/useConversations';

export default function VendorMessagesScreen() {
  const router = useRouter();
  const { conversations, isLoading, fetchConversations } = useConversations();

  useEffect(() => {
    useConversations.getState().startPolling('vendor', 10000);
    return () => useConversations.getState().stopPolling();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="border-b border-border/50 px-4 py-3">
        <Text variant="h3" className="font-bold">
          Messages
        </Text>
      </View>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => fetchConversations('vendor')}
          />
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
    </SafeAreaView>
  );
}
