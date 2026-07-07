import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { MapPin, Truck, CreditCard, Check, ChevronLeft } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { useCart } from '@/hooks/useCart';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { formatCurrency } from '@/lib/money';

const CHECKOUT_STEPS = [
  { id: 1, name: 'Address', icon: MapPin },
  { id: 2, name: 'Shipping', icon: Truck },
  { id: 3, name: 'Payment', icon: CreditCard },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <View className="flex-row items-center justify-between px-2">
      {CHECKOUT_STEPS.map((step, index) => {
        const isComplete = index + 1 < currentStep;
        const isActive = index + 1 === currentStep;

        return (
          <React.Fragment key={step.id}>
            <View className="items-center gap-2">
              <View
                className={`size-10 items-center justify-center rounded-full ${
                  isComplete
                    ? 'bg-primary'
                    : isActive
                      ? 'border-primary bg-primary/10 border-2'
                      : 'bg-secondary'
                }`}>
                {isComplete ? (
                  <Icon as={Check} size={18} className="text-primary-foreground" />
                ) : (
                  <Icon
                    as={step.icon}
                    size={18}
                    className={isActive ? 'text-primary' : 'text-muted-foreground'}
                  />
                )}
              </View>
              <Text
                className={`text-xs font-medium ${
                  isActive
                    ? 'text-primary'
                    : isComplete
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                }`}>
                {step.name}
              </Text>
            </View>
            {index < CHECKOUT_STEPS.length - 1 && (
              <View
                className={`mx-2 h-0.5 flex-1 rounded-full ${
                  index + 1 < currentStep ? 'bg-primary' : 'bg-secondary'
                }`}
                style={{ marginTop: -16 }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function ShippingOption({
  name,
  price,
  estimated,
  isSelected,
  onSelect,
}: {
  name: string;
  price: number;
  estimated: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      className={`flex-row items-center justify-between rounded-2xl p-4 ${
        isSelected ? 'bg-primary/10' : 'bg-card shadow-card'
      }`}>
      <View className="flex-row items-center gap-3">
        <View
          className={`size-5 items-center justify-center rounded-full border-2 ${
            isSelected ? 'border-primary bg-primary' : 'border-border'
          }`}>
          {isSelected && <View className="bg-primary-foreground size-2 rounded-full" />}
        </View>
        <View>
          <Text className="text-foreground text-sm font-medium">{name}</Text>
          <Text className="text-muted-foreground text-xs">{estimated}</Text>
        </View>
      </View>
      <Text className="text-foreground text-sm font-semibold">
        {price === 0 ? 'Free' : formatCurrency(price, 'USD')}
      </Text>
    </Pressable>
  );
}

export default function CheckoutScreen() {
  const { cartItems, cartTotalCents, clearCart } = useCart();
  const [loading, setLoading] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(2);
  const [selectedShipping, setSelectedShipping] = React.useState('standard');
  const taxCents = Math.round(cartTotalCents * 0.08);
  const shippingCents = selectedShipping === 'express' ? 999 : 0;
  const totalCents = cartTotalCents + shippingCents + taxCents;

  const shippingOptions = [
    { id: 'standard', name: 'Standard Shipping', price: 0, estimated: '5-7 business days' },
    { id: 'express', name: 'Express Shipping', price: 999, estimated: '2-3 business days' },
  ];

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          priceCents: item.priceCents,
        })),
      };

      const res = await api.post('/user/orders', payload);
      if (res.orderId) {
        await clearCart();
        router.replace('/(user)/orders');
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-background flex-1">
      <View className="bg-card border-border flex-row items-center gap-3 border-b px-5 py-3">
        <Pressable
          onPress={() => router.back()}
          className="bg-secondary size-10 items-center justify-center rounded-xl">
          <Icon as={ChevronLeft} size={20} className="text-foreground" />
        </Pressable>
        <Text className="text-foreground text-lg font-bold">Checkout</Text>
      </View>

      <ScrollView contentContainerClassName="gap-5 p-5 pb-8" showsVerticalScrollIndicator={false}>
        <StepIndicator currentStep={currentStep} />

        <View className="gap-4">
          <Text className="text-foreground text-base font-semibold">Shipping Method</Text>
          <View className="gap-3">
            {shippingOptions.map((option) => (
              <ShippingOption
                key={option.id}
                name={option.name}
                price={option.price}
                estimated={option.estimated}
                isSelected={selectedShipping === option.id}
                onSelect={() => setSelectedShipping(option.id)}
              />
            ))}
          </View>
        </View>

        <View className="bg-card border-border gap-4 rounded-2xl border p-5">
          <Text className="text-foreground text-base font-semibold">Order Summary</Text>
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground text-sm">
                Subtotal ({cartItems.length} items)
              </Text>
              <Text className="text-foreground text-sm font-medium">
                {formatCurrency(cartTotalCents, 'USD')}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground text-sm">Shipping</Text>
              <Text className="text-sm font-medium">
                {shippingCents === 0 ? (
                  <Text className="text-success">Free</Text>
                ) : (
                  <Text className="text-foreground">{formatCurrency(shippingCents, 'USD')}</Text>
                )}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground text-sm">Tax</Text>
              <Text className="text-foreground text-sm font-medium">
                {formatCurrency(taxCents, 'USD')}
              </Text>
            </View>
          </View>

          <View className="bg-border h-px" />

          <View className="flex-row items-center justify-between">
            <Text className="text-foreground text-base font-semibold">Total</Text>
            <Text className="text-primary text-lg font-bold">
              {formatCurrency(totalCents, 'USD')}
            </Text>
          </View>
        </View>

        <Button
          className="h-12 w-full rounded-2xl"
          onPress={handleCheckout}
          disabled={loading || cartItems.length === 0}>
          <Text className="text-primary-foreground font-semibold">
            {loading ? 'Processing...' : 'Place Order'}
          </Text>
        </Button>
      </ScrollView>
    </View>
  );
}
