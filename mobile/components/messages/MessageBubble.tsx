import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

interface MessageBubbleProps {
  content: string;
  createdAt: string;
  isOwn: boolean;
  senderName?: string;
  showSender?: boolean;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({
  content,
  createdAt,
  isOwn,
  senderName,
  showSender,
}: MessageBubbleProps) {
  return (
    <View className={cn('mb-3 px-4', isOwn ? 'items-end' : 'items-start')}>
      {showSender && senderName && !isOwn ? (
        <Text className="mb-1 text-xs font-medium text-muted-foreground">{senderName}</Text>
      ) : null}
      <View
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5',
          isOwn ? 'bg-primary rounded-tr-md' : 'bg-muted rounded-tl-md'
        )}>
        <Text className={cn('text-sm leading-5', isOwn ? 'text-primary-foreground' : 'text-foreground')}>
          {content}
        </Text>
      </View>
      <Text className="mt-0.5 text-[11px] text-muted-foreground">{formatTime(createdAt)}</Text>
    </View>
  );
}
