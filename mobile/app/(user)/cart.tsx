import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { CartItemCard } from '@/components/CartItemCard';
import { Icon } from '@/components/ui/icon';
import { OrderSummary } from '@/components/OrderSummary';
import * as React from 'react';
import { ScrollView, View, useWindowDimensions, Pressable } from 'react-native';
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

function CouponSection() {
  const { coupon, couponLoading, couponError, validateCoupon, removeCoupon } = useCart();
  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = React.useCallback(
    (data: { code: string }) => {
      validateCoupon(data.code.trim());
    },
    [validateCoupon]
  );

  if (coupon) {
    return (
      <View className="bg-card shadow-card flex-row items-center gap-3 rounded-2xl p-4">
        <View className="bg-primary/10 size-10 items-center justify-center rounded-xl">
          <Icon as={Tag} size={18} className="text-primary" />
        </View>
        <View className="flex-1">
          <Text className="text-foreground text-sm font-semibold">{coupon.code}</Text>
          {coupon.description ? (
            <Text className="text-muted-foreground text-xs">{coupon.description}</Text>
          ) : null}
        </View>
        <Pressable
          onPress={removeCoupon}
          className="bg-muted size-8 items-center justify-center rounded-full">
          <Icon as={X} size={16} className="text-muted-foreground" />
        </Pressable>
      </View>
    );
  }

  return (
    <View className="gap-2">
      <View className="flex-row gap-2">
        <Input
          placeholder="Enter coupon code"
          className="bg-secondary h-12 flex-1 rounded-2xl border-0"
          autoCapitalize="characters"
          onChangeText={(v) => setValue('code', v)}
        />
        <Button
          className="h-12 rounded-2xl"
          variant="outline"
          onPress={handleSubmit(onSubmit)}
          disabled={couponLoading}>
          <Text>{couponLoading ? '...' : 'Apply'}</Text>
        </Button>
      </View>
      {couponError ? <Text className="text-destructive text-xs">{couponError}</Text> : null}
    </View>
  );
}

export default function CartScreen() {
  const { cartItems, cartTotalCents, isLoading, loadCart, coupon } = useCart();
  const { width } = useWindowDimensions();
  const isWeb = width >= 1024;
  const loaded = React.useRef(false);

  React.useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      loadCart();
    }
  }, [loadCart]);

  if (isLoading) {
    return (
      <View className="bg-background flex-1 items-center justify-center p-4">
        <Text className="text-muted-foreground">Loading cart...</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View className="bg-background flex-1 items-center justify-center p-6">
        <View className="items-center gap-4">
          <View className="bg-secondary size-24 items-center justify-center rounded-full">
            <Icon as={ShoppingBag} size={40} className="text-muted-foreground" />
          </View>
          <View className="items-center gap-2">
            <Text className="text-foreground text-xl font-bold">Your cart is empty</Text>
            <Text className="text-muted-foreground text-center text-sm">
              Looks like you haven't added anything{'\n'}to your cart yet.
            </Text>
          </View>
          <Link href="/(user)/(tabs)/home" asChild>
            <Button className="mt-2 h-12 rounded-2xl">
              <Text className="text-primary-foreground font-semibold">Start Shopping</Text>
            </Button>
          </Link>
        </View>
      </View>
    );
  }

  const subtotalCents = cartTotalCents;
  const shippingCents = subtotalCents >= 5000 ? 0 : 599;
  const taxCents = Math.round(subtotalCents * 0.08);
  const discountCents = coupon?.discountCents || 0;
  const totalCents = subtotalCents - discountCents + shippingCents + taxCents;

  return (
    <View className="bg-background flex-1">
      <View className="flex-1 flex-row">
        <ScrollView
          contentContainerClassName={`gap-4 ${isWeb ? 'w-2/3 p-6' : 'p-5 pb-48'}`}
          className={isWeb ? 'border-border/50 border-r' : ''}
          showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between">
            <View className="gap-0.5">
              <Text className="text-foreground text-xl font-bold">My cart</Text>
              <Text className="text-muted-foreground text-sm">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>

          <View className="gap-3">
            {cartItems.map((item) => (
              <CartItemCard key={item.id} item={item} />
            ))}
          </View>

          <CouponSection />
        </ScrollView>

        {isWeb && (
          <View className="w-1/3 p-6">
            <OrderSummary
              subtotal={subtotalCents}
              discount={discountCents}
              shipping={shippingCents}
              tax={taxCents}
              total={totalCents}
              itemCount={cartItems.length}
              onCheckout={() => {}}
              showFreeShippingBar
            />
          </View>
        )}
      </View>

      {!isWeb && (
        <View className="border-border bg-card absolute bottom-0 w-full border-t p-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-muted-foreground text-xs">Total</Text>
              <Text className="text-primary text-xl font-bold">
                {formatCurrency(totalCents, 'USD')}
              </Text>
            </View>
            <Link href="/(user)/checkout" asChild>
              <Button className="h-12 rounded-2xl px-8">
                <Text className="text-primary-foreground font-semibold">
                  Checkout for {formatCurrency(totalCents, 'USD')}
                </Text>
              </Button>
            </Link>
          </View>
        </View>
      )}
    </View>
  );
}
