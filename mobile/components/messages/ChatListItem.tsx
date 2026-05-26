import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { User, Store } from 'lucide-react-native';
import { View, Pressable } from 'react-native';
import { cn } from '@/lib/utils';

interface ChatListItemProps {
  name: string;
  subtitle?: string | null;
  lastMessage?: string | null;
  timestamp?: string | null;
  unread?: number;
  avatarUrl?: string | null;
  icon?: 'user' | 'store';
  onPress: () => void;
  className?: string;
}

function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return new Date(dateStr).toLocaleDateString();
}

export function ChatListItem({
  name,
  subtitle,
  lastMessage,
  timestamp,
  unread = 0,
  avatarUrl,
  icon = 'user',
  onPress,
  className,
}: ChatListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-3 border-b border-border/50 px-4 py-3 active:bg-muted/50',
        className
      )}>
      <Avatar alt={name} className="size-12">
        {avatarUrl ? (
          <AvatarImage source={{ uri: avatarUrl }} />
        ) : (
          <AvatarFallback className="bg-secondary">
            <Icon as={icon === 'store' ? Store : User} size={20} className="text-foreground" />
          </AvatarFallback>
        )}
      </Avatar>
      <View className="flex-1 justify-center">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1">
            <Text className="text-base font-semibold leading-5" numberOfLines={1}>
              {name}
            </Text>
            {unread > 0 && (
              <Badge variant="default" className="bg-primary min-w-5 items-center px-1.5 py-0">
                <Text className="text-xs font-bold text-primary-foreground">
                  {unread > 99 ? '99+' : unread}
                </Text>
              </Badge>
            )}
          </View>
          {timestamp && (
            <Text className="ml-2 text-xs text-muted-foreground shrink-0">
              {formatRelativeTime(timestamp)}
            </Text>
          )}
        </View>
        {subtitle ? (
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {lastMessage ? (
          <Text className="mt-0.5 text-sm text-muted-foreground" numberOfLines={1}>
            {lastMessage}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
