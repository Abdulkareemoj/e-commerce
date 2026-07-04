import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatCurrency } from '@/lib/money';
import { Minus, Plus, X } from 'lucide-react-native';
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
    <View className="bg-card shadow-card flex-row items-center gap-3 rounded-2xl p-3">
      <Image
        source={{ uri: item.image }}
        className="bg-muted size-20 rounded-xl"
        resizeMode="cover"
      />

      <View className="flex-1 gap-1.5">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1">
            <Text
              className="text-foreground text-sm font-medium"
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.title || 'Product'}
            </Text>
            {item.variantName && (
              <Text className="text-muted-foreground text-xs">{item.variantName}</Text>
            )}
          </View>
          <Pressable
            onPress={handleRemove}
            className="bg-muted size-6 items-center justify-center rounded-full">
            <Icon as={X} size={12} className="text-muted-foreground" />
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="bg-secondary flex-row items-center rounded-xl">
            <Pressable
              onPress={() => handleQuantityChange(-1)}
              className="active:bg-muted size-8 items-center justify-center rounded-l-xl">
              <Icon as={Minus} size={14} className="text-foreground" />
            </Pressable>
            <Text className="text-foreground w-8 text-center text-sm font-semibold">
              {item.qty}
            </Text>
            <Pressable
              onPress={() => handleQuantityChange(1)}
              className="active:bg-muted size-8 items-center justify-center rounded-r-xl">
              <Icon as={Plus} size={14} className="text-foreground" />
            </Pressable>
          </View>
          <Text className="text-primary text-base font-bold">
            {formatCurrency(item.priceCents * item.qty, 'USD')}
          </Text>
        </View>
      </View>
    </View>
  );
}
