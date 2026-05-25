import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatCurrency } from '@/lib/money';
import { Trash2, Minus, Plus } from 'lucide-react-native';
import React from 'react';
import { Image, View, Pressable } from 'react-native';
import { useCart, HydratedCartItem } from '@/hooks/useCart';

interface CartItemCardProps {
  item: HydratedCartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { updateItemQuantity, removeItem } = useCart();

  const handleRemove = async () => {
    await removeItem(item.id);
  };

  const handleQuantityChange = async (delta: number) => {
    const newQty = item.qty + delta;
    if (newQty > 0) {
      await updateItemQuantity(item.id, newQty);
    } else {
      await handleRemove();
    }
  };

  return (
    <Card className="w-full flex-row gap-4 overflow-hidden p-0">
      <Image
        source={{ uri: item.image || 'https://picsum.photos/seed/cartitem/400/300' }}
        className="size-24 rounded-xl bg-muted"
        resizeMode="cover"
      />
      <View className="flex-1 flex-col justify-between py-1 pr-1">
        <View className="flex-row justify-between">
          <View className="flex-1 pr-3">
            <Text className="line-clamp-2 text-sm font-medium leading-snug tracking-tight">
              {item.title || `Product`}
            </Text>
            {item.variantId && (
              <Text className="mt-0.5 text-xs text-muted-foreground">Variant</Text>
            )}
          </View>
          <Pressable
            onPress={handleRemove}
            className="size-8 items-center justify-center rounded-lg active:bg-destructive/10">
            <Icon as={Trash2} size={18} className="text-muted-foreground" />
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 rounded-xl border border-border bg-background p-1">
            <Pressable
              onPress={() => handleQuantityChange(-1)}
              className="flex size-7 items-center justify-center rounded-lg active:bg-muted">
              <Icon as={Minus} size={14} className="text-muted-foreground" />
            </Pressable>
            <Text className="w-6 text-center text-sm font-semibold">{item.qty}</Text>
            <Pressable
              onPress={() => handleQuantityChange(1)}
              className="flex size-7 items-center justify-center rounded-lg active:bg-muted">
              <Icon as={Plus} size={14} className="text-muted-foreground" />
            </Pressable>
          </View>
          <Text className="text-base font-bold text-primary">
            {formatCurrency(item.priceCents * item.qty, 'USD')}
          </Text>
        </View>
      </View>
    </Card>
  );
}
