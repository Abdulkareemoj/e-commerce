import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { CartItemCard } from '@/components/CartItemCard';
import { Icon } from '@/components/ui/icon';
import * as React from 'react';
import { ScrollView, View, useWindowDimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatCurrency } from '@/lib/money';
import { Link } from 'expo-router';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/lib/authStore';
import { ShoppingBag, ArrowRight, X, Tag } from 'lucide-react-native';

const couponSchema = z.object({
  code: z.string().min(1, 'Enter a coupon code'),
});

const SHIPPING_CENTS = 0;
const TAX_RATE = 0.08;

function OrderSummary({
  subtotalCents,
  isSticky = false,
}: {
  subtotalCents: number;
  isSticky?: boolean;
}) {
  const { isAuthenticated } = useAuthStore();
  const coupon = useCart((s) => s.coupon);
  const shippingCents = subtotalCents >= 5000 ? SHIPPING_CENTS : 599;
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const discountCents = coupon?.discountCents || 0;
  const totalCents = subtotalCents - discountCents + shippingCents + taxCents;
  const freeShippingThreshold = 5000;

  return (
    <Card className={`gap-4 ${isSticky ? 'lg:hidden' : 'w-full lg:w-auto'}`}>
      <Text variant="h3" className="font-bold tracking-tight">
        Order Summary
      </Text>

      {subtotalCents < freeShippingThreshold && (
        <View className="rounded-xl bg-primary/5 p-3">
          <Text className="text-xs font-medium text-primary">
            Add {formatCurrency(freeShippingThreshold - subtotalCents, 'USD')} more for free
            shipping
          </Text>
          <View className="mt-2 h-1.5 rounded-full bg-muted">
            <View
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${Math.min((subtotalCents / freeShippingThreshold) * 100, 100)}%` }}
            />
          </View>
        </View>
      )}

      <View className="gap-2">
        <View className="flex-row justify-between">
          <Text className="text-muted-foreground">Subtotal</Text>
          <Text className="font-medium">{formatCurrency(subtotalCents, 'USD')}</Text>
        </View>
        {discountCents > 0 && (
          <View className="flex-row justify-between">
            <Text className="text-green-600">Discount</Text>
            <Text className="font-medium text-green-600">-{formatCurrency(discountCents, 'USD')}</Text>
          </View>
        )}
        <View className="flex-row justify-between">
          <Text className="text-muted-foreground">Shipping</Text>
          <Text className="font-medium">
            {shippingCents === 0 ? (
              <Text className="text-green-600">Free</Text>
            ) : (
              formatCurrency(shippingCents, 'USD')
            )}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-muted-foreground">Estimated Tax</Text>
          <Text className="font-medium">{formatCurrency(taxCents, 'USD')}</Text>
        </View>
      </View>

      <Separator />

      <View className="flex-row justify-between">
        <Text variant="h3" className="font-bold">
          Total
        </Text>
        <Text variant="h3" className="font-bold text-primary">
          {formatCurrency(totalCents, 'USD')}
        </Text>
      </View>

      {isAuthenticated ? (
        <Link href="/(user)/checkout" asChild>
          <Button className="mt-1 w-full">
            <Text className="font-semibold">Checkout</Text>
            <Icon as={ArrowRight} size={18} />
          </Button>
        </Link>
      ) : (
        <Link href="/(auth)/sign-in" asChild>
          <Button className="mt-1 w-full">
            <Text className="font-semibold">Sign in to Checkout</Text>
          </Button>
        </Link>
      )}
    </Card>
  );
}

function CouponSection() {
  const { coupon, couponLoading, couponError, validateCoupon, removeCoupon } = useCart();
  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = React.useCallback((data: { code: string }) => {
    validateCoupon(data.code.trim());
  }, [validateCoupon]);

  if (coupon) {
    return (
      <Card className="flex-row items-center gap-3 p-3">
        <Icon as={Tag} size={20} className="text-primary" />
        <View className="flex-1">
          <Text className="text-sm font-semibold">{coupon.code}</Text>
          {coupon.description ? (
            <Text className="text-xs text-muted-foreground">{coupon.description}</Text>
          ) : null}
        </View>
        <Pressable onPress={removeCoupon} className="size-8 items-center justify-center">
          <Icon as={X} size={18} className="text-muted-foreground" />
        </Pressable>
      </Card>
    );
  }

  return (
    <View className="gap-2">
      <View className="flex-row gap-2">
        <Input
          placeholder="Enter coupon code"
          className="flex-1"
          autoCapitalize="characters"
          onChangeText={(v) => setValue('code', v)}
        />
        <Button onPress={handleSubmit(onSubmit)} disabled={couponLoading}>
          <Text>{couponLoading ? '...' : 'Apply'}</Text>
        </Button>
      </View>
      {couponError ? (
        <Text className="text-xs text-destructive">{couponError}</Text>
      ) : null}
    </View>
  );
}

export default function CartScreen() {
  const { cartItems, cartTotalCents, isLoading, loadCart } = useCart();
  const { width } = useWindowDimensions();
  const isWeb = width >= 1024;
  const loaded = useRef(false);

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      loadCart();
    }
  }, [loadCart]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background p-4">
        <Text className="text-muted-foreground">Loading cart...</Text>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background p-6">
        <View className="items-center gap-4">
          <View className="size-20 items-center justify-center rounded-full bg-muted">
            <Icon as={ShoppingBag} size={32} className="text-muted-foreground" />
          </View>
          <View className="items-center gap-2">
            <Text variant="h2" className="font-bold tracking-tight">
              Your cart is empty
            </Text>
            <Text className="text-center text-muted-foreground">
              Looks like you haven't added anything to your cart yet.{'\n'}Explore our products and
              find something you love.
            </Text>
          </View>
          <Link href="/(user)/catalog" asChild>
            <Button className="mt-2">
              <Text className="font-semibold">Start Shopping</Text>
              <Icon as={ArrowRight} size={18} />
            </Button>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 flex-row">
        <ScrollView
          contentContainerClassName={`p-4 gap-5 ${isWeb ? 'w-2/3' : 'w-full pb-48'}`}
          className={isWeb ? 'border-r border-border/50' : ''}
          showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between">
            <Text variant="h2" className="font-bold tracking-tight">
              Shopping Cart
            </Text>
            <Text className="text-sm text-muted-foreground">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </Text>
          </View>
          <View className="gap-3">
            {cartItems.map((item) => (
              <CartItemCard key={item.id} item={item} />
            ))}
          </View>
          <CouponSection />
        </ScrollView>

        {isWeb && (
          <View className="w-1/3 p-4">
            <OrderSummary subtotalCents={cartTotalCents} />
          </View>
        )}
      </View>

      {!isWeb && (
        <View className="absolute bottom-0 w-full border-t border-border/50 bg-background/95 p-4 backdrop-blur-lg">
          <OrderSummary subtotalCents={cartTotalCents} isSticky={true} />
        </View>
      )}
    </SafeAreaView>
  );
}
