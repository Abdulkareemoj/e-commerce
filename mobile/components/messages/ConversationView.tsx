import { useEffect, useState, useRef, useCallback } from 'react';
import { Text } from '@/components/ui/text';
import { ConversationHeader } from './ConversationHeader';
import { MessageBubble } from './MessageBubble';
import { MessageComposer, type PickedAsset } from './MessageComposer';
import type { MessageItem } from './types';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/icon';
import { MessageSquare } from 'lucide-react-native';

interface ConversationViewProps {
  conversationId: string;
  /** If true, uses vendor messaging endpoints; otherwise user messaging */
  isVendor?: boolean;
  /** Custom header config */
  header?: {
    name: string;
    subtitle?: string;
    avatarUrl?: string | null;
    icon?: 'user' | 'store';
  };
  onBack?: () => void;
}

const POLL_INTERVAL = 8000;

export function ConversationView({
  conversationId,
  isVendor = false,
  header,
  onBack,
}: ConversationViewProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const userId = useAuthStore((s) => s.user?.id);
  const basePath = isVendor ? '/vendor/messaging' : '/user/messaging';

  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.get(`${basePath}/${conversationId}`);
      const conv = res.conversation;
      if (conv?.messages) {
        setMessages(conv.messages.reverse());
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, basePath]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    }
  }, [loading, messages.length]);

  const handleSend = async (content: string, _assets?: PickedAsset[]) => {
    if (sending) return;
    setSending(true);
    try {
      const res = await api.post(`${basePath}/send`, {
        conversationId,
        content,
      });
      if (res.message) {
        setMessages((prev) => [...prev, res.message]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-background flex-1">
        <ConversationHeader
          name={header?.name || 'Conversation'}
          subtitle="Loading..."
          avatarUrl={header?.avatarUrl}
          icon={header?.icon}
          onBack={onBack}
        />
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1" edges={['top']}>
      <ConversationHeader
        name={header?.name || 'Conversation'}
        subtitle={header?.subtitle}
        avatarUrl={header?.avatarUrl}
        icon={header?.icon}
        onBack={onBack}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        {messages.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-2">
            <Icon as={MessageSquare} size={32} className="text-muted-foreground" />
            <Text className="text-muted-foreground">No messages yet. Say hello!</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerClassName="py-4"
            keyboardShouldPersistTaps="handled">
            {messages.map((msg, index) => {
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const showSender = !prevMsg || prevMsg.senderId !== msg.senderId;
              return (
                <MessageBubble
                  key={msg.id}
                  content={msg.content}
                  createdAt={msg.createdAt}
                  isOwn={msg.senderId === userId}
                  senderName={msg.sender?.name}
                  showSender={showSender}
                />
              );
            })}
          </ScrollView>
        )}
        <MessageComposer onSend={handleSend} disabled={sending} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
