import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { MapPin, Truck, CreditCard, CheckCircle, ChevronLeft } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { formatCurrency } from '@/lib/money';

const CHECKOUT_STEPS = [
  { id: 1, name: 'Address', icon: MapPin },
  { id: 2, name: 'Shipping', icon: Truck },
  { id: 3, name: 'Payment', icon: CreditCard },
];

function StepIndicator({
  step,
  index,
  isActive,
  isComplete,
}: {
  step: (typeof CHECKOUT_STEPS)[0];
  index: number;
  isActive: boolean;
  isComplete: boolean;
}) {
  return (
    <View className="flex-1 flex-col items-center">
      <View
        className={`size-12 items-center justify-center rounded-full border-2 transition-all ${
          isComplete
            ? 'border-primary bg-primary'
            : isActive
              ? 'border-primary bg-primary/10'
              : 'border-muted-foreground/30 bg-muted'
        }`}>
        {isComplete ? (
          <Icon as={CheckCircle} size={20} className="text-primary-foreground" />
        ) : (
          <Icon
            as={step.icon}
            size={20}
            className={isActive ? 'text-primary' : 'text-muted-foreground'}
          />
        )}
      </View>
      <Text
        className={`mt-2 text-center text-xs font-medium ${
          isActive ? 'text-primary' : 'text-muted-foreground'
        }`}>
        {step.name}
      </Text>
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
      className={`flex-row items-center justify-between rounded-xl border-2 p-4 transition-all ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-muted-foreground/30'
      }`}>
      <View className="flex-row items-center gap-3">
        <View
          className={`size-5 items-center justify-center rounded-full border-2 ${
            isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
          }`}>
          {isSelected && <View className="size-2 rounded-full bg-primary-foreground" />}
        </View>
        <View>
          <Text className="font-medium">{name}</Text>
          <Text className="text-xs text-muted-foreground">{estimated}</Text>
        </View>
      </View>
      <Text className="font-semibold">{price === 0 ? 'Free' : formatCurrency(price, 'USD')}</Text>
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
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 border-b border-border/50 p-4">
        <Pressable
          onPress={() => router.back()}
          className="size-10 items-center justify-center rounded-xl bg-muted">
          <Icon as={ChevronLeft} size={20} />
        </Pressable>
        <Text variant="h2" className="font-bold tracking-tight">
          Checkout
        </Text>
      </View>

      <ScrollView contentContainerClassName="p-4 gap-6 pb-8" showsVerticalScrollIndicator={false}>
        <View className="rounded-2xl bg-card p-4">
          <View className="flex-row justify-between">
            {CHECKOUT_STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <StepIndicator
                  step={step}
                  index={index}
                  isActive={index + 1 === currentStep}
                  isComplete={index + 1 < currentStep}
                />
                {index < CHECKOUT_STEPS.length - 1 && (
                  <View
                    className={`mx-2 mt-6 h-0.5 flex-1 rounded-full ${
                      index + 1 < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        <Card className="gap-5">
          <Text variant="h3" className="font-bold tracking-tight">
            Shipping Method
          </Text>
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
        </Card>

        <Card className="gap-4">
          <Text variant="h3" className="font-bold tracking-tight">
            Order Summary
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Subtotal ({cartItems.length} items)</Text>
              <Text className="font-medium">{formatCurrency(cartTotalCents, 'USD')}</Text>
            </View>
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
              <Text className="text-muted-foreground">Tax</Text>
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
        </Card>

        <Button
          className="w-full"
          size="lg"
          onPress={handleCheckout}
          disabled={loading || cartItems.length === 0}>
          <Text className="text-base font-semibold">
            {loading ? 'Processing...' : 'Place Order'}
          </Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
