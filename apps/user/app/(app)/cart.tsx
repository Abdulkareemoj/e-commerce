import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CartItemCard } from '@/components/CartItemCard';
import * as React from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '@/lib/money';
import { Link } from 'expo-router';
import { useCart } from '@/hooks/useCart';

// Mock fixed costs (since we don't have a full backend calculation)
const SHIPPING_CENTS = 500; // $5.00
const TAX_RATE = 0.08;

// --- Components ---

function OrderSummary({ subtotalCents, isSticky = false }) {
  const shippingCents = SHIPPING_CENTS;
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + shippingCents + taxCents;

  return (
    <Card className={`gap-3 p-4 ${isSticky ? 'lg:hidden' : 'w-full lg:w-auto'}`}>
      <Text variant="h3" className="font-bold">
        Order Summary
      </Text>
      <View className="gap-1">
        <View className="flex-row justify-between">
          <Text className="text-muted-foreground">Subtotal</Text>
          <Text className="font-medium">{formatCurrency(subtotalCents, 'USD')}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-muted-foreground">Shipping</Text>
          <Text className="font-medium">{formatCurrency(shippingCents, 'USD')}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-muted-foreground">Tax ({TAX_RATE * 100}%)</Text>
          <Text className="font-medium">{formatCurrency(taxCents, 'USD')}</Text>
        </View>
      </View>

      <Separator />

      <View className="flex-row justify-between">
        <Text variant="large" className="font-bold">
          Order Total
        </Text>
        <Text variant="large" className="font-bold text-primary">
          {formatCurrency(totalCents, 'USD')}
        </Text>
      </View>

      <Link href="/(app)/checkout" asChild>
        <Button className="mt-2 w-full">
          <Text>Proceed to Checkout</Text>
        </Button>
      </Link>
    </Card>
  );
}

export default function CartScreen() {
  const { cartItems, cartTotalCents, isLoading } = useCart();
  const { width } = useWindowDimensions();
  const isWeb = width >= 1024; // Tailwind 'lg' breakpoint

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background p-4">
        <Text>Loading Cart...</Text>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background p-4">
        <Text variant="h3" className="mb-2">
          Your Cart is Empty
        </Text>
        <Text className="mb-6 text-center text-muted-foreground">
          Looks like you haven't added anything to your cart yet.
        </Text>
        <Link href="/(app)/catalog" asChild>
          <Button>
            <Text>Start Shopping</Text>
          </Button>
        </Link>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 flex-row">
        {/* Main Content Area */}
        <ScrollView
          contentContainerClassName={`p-4 gap-4 ${isWeb ? 'w-2/3' : 'w-full'}`}
          className={isWeb ? 'border-r border-border' : ''}>
          <Text variant="h2" className="mb-2 font-bold">
            Your Cart ({cartItems.length} Items)
          </Text>
          <View className="gap-4">
            {cartItems.map((item) => (
              <CartItemCard key={item.id} item={item} />
            ))}
          </View>
        </ScrollView>

        {/* Right Column: Order Summary (Web) */}
        {isWeb && (
          <View className="w-1/3 p-4">
            <OrderSummary subtotalCents={cartTotalCents} />
          </View>
        )}
      </View>

      {/* Sticky Footer: Order Summary (Mobile) */}
      {!isWeb && (
        <View className="absolute bottom-0 w-full border-t border-border bg-background/95 p-4">
          <OrderSummary subtotalCents={cartTotalCents} isSticky={true} />
        </View>
      )}
    </SafeAreaView>
  );
}
