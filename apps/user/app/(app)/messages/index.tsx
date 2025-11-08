import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { MessageSquare, Plus } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'expo-router';

// Mock Message Threads
const MOCK_THREADS: {
  id: number;
  sender: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}[] = [
  {
    id: 1,
    sender: 'Support Team',
    lastMessage: 'Your refund has been processed.',
    time: '10m ago',
    unread: true,
  },
  {
    id: 2,
    sender: 'Order ORD-1001',
    lastMessage: 'The item is out for delivery.',
    time: '1h ago',
    unread: false,
  },
  {
    id: 3,
    sender: 'Shipping Inquiry',
    lastMessage: 'We are looking into your request.',
    time: 'Yesterday',
    unread: false,
  },
];

// --- Components ---

function MessageThreadCard({ thread }: { thread: (typeof MOCK_THREADS)[0] }) {
  return (
    <Link href={`/(app)/messages/${thread.id}`} asChild>
      <Pressable>
        <Card
          className={`flex-row gap-3 p-3 active:bg-muted/50 ${thread.unread ? 'border-2 border-primary' : ''}`}>
          <Avatar alt={thread.sender} className="size-12">
            <AvatarFallback className="bg-secondary">
              <Icon as={MessageSquare} size={20} className="text-foreground" />
            </AvatarFallback>
          </Avatar>
          <View className="flex-1 justify-center">
            <View className="flex-row items-center justify-between">
              <Text className={`text-base font-semibold ${thread.unread ? 'text-primary' : ''}`}>
                {thread.sender}
              </Text>
              <Text className="text-xs text-muted-foreground">{thread.time}</Text>
            </View>
            <Text className="line-clamp-1 text-sm text-muted-foreground">{thread.lastMessage}</Text>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}

export default function MessagesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-border p-4">
        <Text variant="h2" className="font-bold">
          Messages
        </Text>
        <Button size="sm">
          <Icon as={Plus} size={16} />
          <Text>New Chat</Text>
        </Button>
      </View>
      <ScrollView contentContainerClassName="p-4 gap-4">
        {MOCK_THREADS.map((thread) => (
          <MessageThreadCard key={thread.id} thread={thread} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
