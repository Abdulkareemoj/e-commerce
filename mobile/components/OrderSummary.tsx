import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { formatCurrency } from '@/lib/money';
import React from 'react';

interface OrderSummaryProps {
  subtotal: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  total: number;
  itemCount?: number;
  onCheckout?: () => void;
  checkoutLabel?: string;
  showFreeShippingBar?: boolean;
  freeShippingThreshold?: number;
}

export function OrderSummary({
  subtotal,
  discount = 0,
  shipping = 0,
  tax = 0,
  total,
  itemCount,
  onCheckout,
  checkoutLabel,
  showFreeShippingBar = false,
  freeShippingThreshold = 5000,
}: OrderSummaryProps) {
  const freeShippingProgress = showFreeShippingBar
    ? Math.min((subtotal / freeShippingThreshold) * 100, 100)
    : 0;
  const amountToFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

  return (
    <View className="gap-4">
      {showFreeShippingBar && shipping === 0 && subtotal < freeShippingThreshold && (
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-muted-foreground text-xs">
              Add {formatCurrency(amountToFreeShipping)} more for free shipping
            </Text>
            <Text className="text-primary text-xs font-medium">Free</Text>
          </View>
          <View className="bg-secondary h-1.5 overflow-hidden rounded-full">
            <View
              className="bg-primary h-full rounded-full"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </View>
        </View>
      )}

      <View className="bg-card shadow-card gap-3 rounded-2xl p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-muted-foreground text-sm">
            Subtotal{itemCount ? ` (${itemCount} items)` : ''}
          </Text>
          <Text className="text-foreground text-sm font-medium">{formatCurrency(subtotal)}</Text>
        </View>

        {discount > 0 && (
          <View className="flex-row items-center justify-between">
            <Text className="text-muted-foreground text-sm">Discount</Text>
            <Text className="text-sm font-medium text-emerald-500">
              -{formatCurrency(discount)}
            </Text>
          </View>
        )}

        <View className="flex-row items-center justify-between">
          <Text className="text-muted-foreground text-sm">Delivery Fee</Text>
          <Text className="text-foreground text-sm font-medium">
            {shipping === 0 ? (
              <Text className="text-emerald-500">Free</Text>
            ) : (
              formatCurrency(shipping)
            )}
          </Text>
        </View>

        {tax > 0 && (
          <View className="flex-row items-center justify-between">
            <Text className="text-muted-foreground text-sm">Tax</Text>
            <Text className="text-foreground text-sm font-medium">{formatCurrency(tax)}</Text>
          </View>
        )}

        <View className="bg-border h-px" />

        <View className="flex-row items-center justify-between">
          <Text className="text-foreground text-base font-semibold">Total</Text>
          <Text className="text-primary text-lg font-bold">{formatCurrency(total)}</Text>
        </View>

        {onCheckout && (
          <Button className="mt-1 h-12 rounded-2xl" onPress={onCheckout}>
            <Text className="text-primary-foreground font-semibold">
              {checkoutLabel || `Checkout for ${formatCurrency(total)}`}
            </Text>
          </Button>
        )}
      </View>
    </View>
  );
}
