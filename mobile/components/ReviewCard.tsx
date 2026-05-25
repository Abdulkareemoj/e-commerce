import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from '@/components/StarRating';
import { Review } from '@/types';
import React from 'react';
import { View } from 'react-native';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const initials = review.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="gap-3 p-4">
      <View className="flex-row items-center gap-3">
        <Avatar>
          {review.user.image ? (
            <AvatarImage source={{ uri: review.user.image }} />
          ) : null}
          <AvatarFallback>
            <Text className="text-xs font-bold text-muted-foreground">{initials || 'U'}</Text>
          </AvatarFallback>
        </Avatar>
        <View className="flex-1">
          <Text className="text-sm font-semibold">{review.user.name}</Text>
          <StarRating rating={review.rating} size={12} />
        </View>
        <Text className="text-xs text-muted-foreground">
          {new Date(review.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {review.title ? (
        <Text className="text-sm font-medium">{review.title}</Text>
      ) : null}

      {review.body ? (
        <Text className="text-sm leading-relaxed text-muted-foreground">{review.body}</Text>
      ) : null}
    </Card>
  );
}
