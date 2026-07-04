import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Pressable, View } from 'react-native';
import { Zap } from 'lucide-react-native';
import React from 'react';

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  onPress?: () => void;
}

export function HeroBanner({
  title = 'Clearance Sales',
  subtitle = 'Up to 50% Off',
  badge = '%',
  onPress,
}: HeroBannerProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-primary shadow-elevated relative overflow-hidden rounded-2xl p-5"
      style={{
        minHeight: 140,
      }}>
      <View className="bg-primary-foreground/10 absolute -top-6 -right-6 size-24 rounded-full" />
      <View className="bg-primary-foreground/5 absolute right-8 -bottom-8 size-32 rounded-full" />

      <View className="relative z-10 flex-1 justify-between">
        <View className="bg-primary-foreground/20 mb-3 flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1">
          <Icon as={Zap} size={12} className="text-primary-foreground" />
          <Text className="text-primary-foreground text-xs font-semibold">
            {badge} {subtitle}
          </Text>
        </View>

        <View className="gap-1">
          <Text className="text-primary-foreground text-2xl leading-tight font-bold">{title}</Text>
          <Text className="text-primary-foreground/80 text-sm">
            Don&apos;t miss out on these deals
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
