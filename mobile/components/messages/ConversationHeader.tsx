import { Text } from '@/components/ui/text';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Store, MoreHorizontal } from 'lucide-react-native';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { cn } from '@/lib/utils';

interface ConversationHeaderProps {
  name: string;
  subtitle?: string;
  avatarUrl?: string | null;
  icon?: 'user' | 'store';
  onBack?: () => void;
  onMore?: () => void;
  className?: string;
}

export function ConversationHeader({
  name,
  subtitle,
  avatarUrl,
  icon = 'user',
  onBack,
  onMore,
  className,
}: ConversationHeaderProps) {
  const router = useRouter();

  return (
    <View
      className={cn(
        'flex-row items-center gap-3 border-b border-border/50 bg-background px-4 py-3',
        className
      )}>
      <Button
        variant="ghost"
        size="icon"
        className="size-9"
        onPress={onBack || (() => router.back())}>
        <Icon as={ArrowLeft} size={22} className="text-foreground" />
      </Button>
      <Avatar alt={name} className="size-10">
        {avatarUrl ? (
          <AvatarImage source={{ uri: avatarUrl }} />
        ) : (
          <AvatarFallback className="bg-secondary">
            <Icon as={icon === 'store' ? Store : User} size={18} className="text-foreground" />
          </AvatarFallback>
        )}
      </Avatar>
      <View className="flex-1">
        <Text className="text-base font-semibold leading-5" numberOfLines={1}>
          {name}
        </Text>
        {subtitle ? (
          <Text className="text-xs text-muted-foreground">{subtitle}</Text>
        ) : null}
      </View>
      {onMore && (
        <Button variant="ghost" size="icon" className="size-9" onPress={onMore}>
          <Icon as={MoreHorizontal} size={20} className="text-foreground" />
        </Button>
      )}
    </View>
  );
}
