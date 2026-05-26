import React, { useEffect } from 'react';
import { Text } from '@/components/ui/text';
import { ChatListItem } from '@/components/messages/ChatListItem';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/authStore';
import { Button } from '@/components/ui/button';
import { Link } from 'expo-router';
import { useConversations } from '@/hooks/useConversations';

export default function UserMessagesScreen() {
  const router = useRouter();
  const { conversations, isLoading, fetchConversations } = useConversations();
  const { isAuthenticated, user, isLoading: authLoading, initializeAuth } = useAuthStore();

  React.useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'user') {
      useConversations.getState().startPolling('user', 10000);
    }
    return () => useConversations.getState().stopPolling();
  }, [isAuthenticated, user]);

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'user') {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center p-6 gap-4">
          <Icon as={MessageSquare} size={40} className="text-muted-foreground" />
          <Text className="text-center text-muted-foreground">
            Sign in as a buyer to view your messages.
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Button variant="default">
              <Text>Sign In</Text>
            </Button>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

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
            onRefresh={() => fetchConversations('user')}
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
  );
}
