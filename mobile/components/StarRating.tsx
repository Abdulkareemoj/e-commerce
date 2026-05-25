import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Star } from 'lucide-react-native';
import React from 'react';
import { View, Pressable } from 'react-native';

interface StarRatingProps {
  rating: number;
  size?: number;
  showValue?: boolean;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({
  rating,
  size = 14,
  showValue = false,
  interactive = false,
  onRate,
}: StarRatingProps) {
  return (
    <View className="flex-row items-center gap-1">
      <View className="flex-row">
        {[...Array(5)].map((_, i) => {
          const filled = i < Math.round(rating);
          return interactive ? (
            <Pressable key={i} onPress={() => onRate?.(i + 1)} className="p-0.5">
              <Icon
                as={Star}
                size={size}
                className={filled ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}
              />
            </Pressable>
          ) : (
            <Icon
              key={i}
              as={Star}
              size={size}
              className={filled ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}
            />
          );
        })}
      </View>
      {showValue && <Text className="text-xs text-muted-foreground">{rating.toFixed(1)}</Text>}
    </View>
  );
}
