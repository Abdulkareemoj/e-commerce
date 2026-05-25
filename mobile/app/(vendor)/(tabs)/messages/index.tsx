import React, { useEffect, useState, useCallback } from 'react';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { MessageSquare } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

function ConversationCard({ conv }: { conv: any }) {
  return (
    <Card className="p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-medium">{conv.buyer?.name || 'Unknown'}</Text>
            {conv.unread > 0 && (
              <Badge variant="default" className="bg-primary px-1.5 py-0">
                <Text className="text-xs font-bold text-primary-foreground">{conv.unread}</Text>
              </Badge>
            )}
          </View>
          <Text className="text-sm text-muted-foreground">{conv.subject || 'No subject'}</Text>
          {conv.lastMessage && (
            <Text className="mt-1 text-xs text-muted-foreground" numberOfLines={1}>
              {conv.lastMessage.content}
            </Text>
          )}
          <Text className="mt-1 text-xs text-muted-foreground">
            {new Date(conv.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </Card>
  );
}

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/vendor/messaging');
      setConversations(res.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading messages...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="p-4 gap-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConversations(); }} />}>
        <Text variant="h2" className="font-bold">Messages</Text>
        {conversations.length === 0 ? (
          <View className="mt-10 items-center gap-2">
            <Icon as={MessageSquare} size={32} className="text-muted-foreground" />
            <Text className="text-muted-foreground">No conversations yet.</Text>
          </View>
        ) : (
          conversations.map((conv) => (
            <ConversationCard key={conv.id} conv={conv} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
