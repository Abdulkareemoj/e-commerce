import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatCurrency } from '@/lib/money';
import { CartItem } from '@/types';
import { Trash2, Minus, Plus } from 'lucide-react-native';
import React from 'react';
import { Image, View } from 'react-native';
import { useCart } from '@/hooks/useCart';

// NOTE: We need a way to get product details (like title and image) from the CartItem (which only holds IDs).
// For now, we will mock the product details based on the productId.
// In a real app, the cart items would be hydrated with product data.

interface CartItemCardProps {
  item: CartItem;
}

// Mock function to get product details based on ID (for display purposes)
function getMockProductDetails(productId: string) {
  // This is a placeholder. In a real app, this data would come from a product cache or API.
  return {
    title: `Product ${productId}`,
    images: ['https://picsum.photos/seed/cartitem/400/300'],
    variantDetails: 'Color: Black, Size: Standard',
  };
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { updateItemQuantity, removeItem } = useCart();
  const productDetails = getMockProductDetails(item.productId);

  const handleRemove = async () => {
    await removeItem(item.id);
    // TODO: Show success toast
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
    <Card className="w-full flex-row gap-3 p-3">
      <Image
        source={{ uri: productDetails.images[0] }}
        className="size-20 rounded-lg bg-muted/50"
        resizeMode="cover"
      />
      <CardContent className="flex-1 flex-col justify-between p-0">
        <View className="flex-row justify-between">
          <View className="flex-1 pr-2">
            <Text className="line-clamp-2 text-sm font-semibold">{productDetails.title}</Text>
            <Text className="text-xs text-muted-foreground">{productDetails.variantDetails}</Text>
          </View>
          <Text className="text-base font-bold text-primary">
            {formatCurrency(item.priceCents * item.qty, 'USD')}
          </Text>
        </View>

        <View className="mt-2 flex-row items-center justify-between">
          {/* Quantity Selector */}
          <View className="flex-row items-center gap-1 rounded-lg border border-border">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onPress={() => handleQuantityChange(-1)}>
              <Icon as={Minus} size={16} />
            </Button>
            <Text className="w-6 text-center font-medium">{item.qty}</Text>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onPress={() => handleQuantityChange(1)}>
              <Icon as={Plus} size={16} />
            </Button>
          </View>

          {/* Remove Button */}
          <Button variant="ghost" size="icon" onPress={handleRemove}>
            <Icon as={Trash2} size={20} className="text-destructive" />
          </Button>
        </View>
      </CardContent>
    </Card>
  );
}
