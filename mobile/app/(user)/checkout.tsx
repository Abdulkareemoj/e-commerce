import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Truck,
  CreditCard,
  Check,
  ChevronLeft,
  Plus,
  Trash2,
  CircleDot,
  Circle,
  Banknote,
} from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable, Alert } from 'react-native';
import { useCart } from '@/hooks/useCart';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { formatCurrency } from '@/lib/money';
import { useCheckoutStore, type Address, type CheckoutStep } from '@/lib/checkoutStore';
import { AuthGuard } from '@/components/AuthGuard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const CHECKOUT_STEPS = [
  { id: 'address', name: 'Address', icon: MapPin },
  { id: 'shipping', name: 'Shipping', icon: Truck },
  { id: 'payment', name: 'Payment', icon: CreditCard },
] as const;

const STEP_ORDER: CheckoutStep[] = ['address', 'shipping', 'payment'];

const addressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  phone: z.string().min(1, 'Phone number is required'),
});

type AddressFormData = z.infer<typeof addressSchema>;

function StepIndicator({ currentStep }: { currentStep: CheckoutStep }) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <View className="flex-row items-center justify-between px-2">
      {CHECKOUT_STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isActive = step.id === currentStep;

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
                  index < currentIndex ? 'bg-primary' : 'bg-secondary'
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

function AddressForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: AddressFormData) => void;
  onCancel: () => void;
}) {
  const { control, handleSubmit, setValue } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
    },
  });

  return (
    <View className="gap-4">
      <Text className="text-foreground text-base font-semibold">Add New Address</Text>
      <View className="bg-card shadow-card gap-4 rounded-2xl p-4">
        <View className="gap-2">
          <Text className="text-muted-foreground text-xs">Full Name</Text>
          <Input placeholder="John Doe" onChangeText={(text) => setValue('name', text)} />
        </View>
        <View className="gap-2">
          <Text className="text-muted-foreground text-xs">Street Address</Text>
          <Input
            placeholder="123 Main Street, Apt 4B"
            onChangeText={(text) => setValue('street', text)}
          />
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1 gap-2">
            <Text className="text-muted-foreground text-xs">City</Text>
            <Input placeholder="New York" onChangeText={(text) => setValue('city', text)} />
          </View>
          <View className="flex-1 gap-2">
            <Text className="text-muted-foreground text-xs">State</Text>
            <Input placeholder="NY" onChangeText={(text) => setValue('state', text)} />
          </View>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1 gap-2">
            <Text className="text-muted-foreground text-xs">ZIP Code</Text>
            <Input
              placeholder="10001"
              keyboardType="number-pad"
              onChangeText={(text) => setValue('zip', text)}
            />
          </View>
          <View className="flex-1 gap-2">
            <Text className="text-muted-foreground text-xs">Phone</Text>
            <Input
              placeholder="+1 (555) 123-4567"
              keyboardType="phone-pad"
              onChangeText={(text) => setValue('phone', text)}
            />
          </View>
        </View>
      </View>
      <View className="flex-row gap-3">
        <Button variant="outline" className="h-12 flex-1 rounded-2xl" onPress={onCancel}>
          <Text>Cancel</Text>
        </Button>
        <Button className="h-12 flex-1 rounded-2xl" onPress={handleSubmit(onSubmit)}>
          <Text className="text-primary-foreground">Save Address</Text>
        </Button>
      </View>
    </View>
  );
}

function AddressStep() {
  const { addresses, selectedAddressId, selectAddress, addAddress, removeAddress, setStep } =
    useCheckoutStore();
  const [showForm, setShowForm] = React.useState(false);

  React.useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/user/addresses');
      if (res.addresses) {
        useCheckoutStore.getState().setAddresses(res.addresses);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  };

  const handleSaveAddress = async (data: AddressFormData) => {
    try {
      const res = await api.post('/user/addresses', { ...data, isDefault: addresses.length === 0 });
      if (res.address) {
        addAddress(res.address);
        setShowForm(false);
      }
    } catch (err) {
      console.error('Failed to save address:', err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/user/addresses/${id}`);
            removeAddress(id);
          } catch (err) {
            console.error('Failed to delete address:', err);
          }
        },
      },
    ]);
  };

  if (showForm) {
    return <AddressForm onSubmit={handleSaveAddress} onCancel={() => setShowForm(false)} />;
  }

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-foreground text-base font-semibold">Delivery Address</Text>
        <Button variant="ghost" size="sm" onPress={() => setShowForm(true)}>
          <Icon as={Plus} size={16} className="text-primary" />
          <Text className="text-primary text-sm">Add New</Text>
        </Button>
      </View>

      {addresses.length === 0 ? (
        <View className="bg-card shadow-card items-center gap-3 rounded-2xl p-6">
          <Icon as={MapPin} size={32} className="text-muted-foreground" />
          <Text className="text-muted-foreground text-sm">No saved addresses</Text>
          <Button variant="outline" size="sm" onPress={() => setShowForm(true)}>
            <Text>Add Your First Address</Text>
          </Button>
        </View>
      ) : (
        <View className="gap-3">
          {addresses.map((address) => (
            <Pressable
              key={address.id}
              onPress={() => selectAddress(address.id)}
              className={`rounded-2xl border p-4 ${
                selectedAddressId === address.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              }`}>
              <View className="flex-row items-start gap-3">
                <View className="mt-1">
                  {selectedAddressId === address.id ? (
                    <Icon as={CircleDot} size={20} className="text-primary" />
                  ) : (
                    <Icon as={Circle} size={20} className="text-muted-foreground" />
                  )}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-foreground text-sm font-semibold">{address.name}</Text>
                    {address.isDefault && (
                      <View className="bg-primary/10 rounded-full px-2 py-0.5">
                        <Text className="text-primary text-xs">Default</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-muted-foreground mt-1 text-sm">{address.street}</Text>
                  <Text className="text-muted-foreground text-sm">
                    {address.city}, {address.state} {address.zip}
                  </Text>
                  <Text className="text-muted-foreground text-sm">{address.phone}</Text>
                </View>
                <Pressable onPress={() => handleDeleteAddress(address.id)} className="p-2">
                  <Icon as={Trash2} size={16} className="text-destructive" />
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <Button
        className="h-12 w-full rounded-2xl"
        disabled={!selectedAddressId}
        onPress={() => setStep('shipping')}>
        <Text className="text-primary-foreground font-semibold">Continue to Shipping</Text>
      </Button>
    </View>
  );
}

function ShippingStep() {
  const { shippingMethod, setShippingMethod, setStep } = useCheckoutStore();

  const shippingOptions = [
    {
      id: 'standard' as const,
      name: 'Standard Shipping',
      price: 0,
      estimated: '5-7 business days',
    },
    {
      id: 'express' as const,
      name: 'Express Shipping',
      price: 999,
      estimated: '2-3 business days',
    },
  ];

  return (
    <View className="gap-4">
      <Text className="text-foreground text-base font-semibold">Shipping Method</Text>
      <View className="gap-3">
        {shippingOptions.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => setShippingMethod(option.id)}
            className={`flex-row items-center justify-between rounded-2xl p-4 ${
              shippingMethod === option.id ? 'bg-primary/10' : 'bg-card shadow-card'
            }`}>
            <View className="flex-row items-center gap-3">
              <View
                className={`size-5 items-center justify-center rounded-full border-2 ${
                  shippingMethod === option.id ? 'border-primary bg-primary' : 'border-border'
                }`}>
                {shippingMethod === option.id && (
                  <View className="bg-primary-foreground size-2 rounded-full" />
                )}
              </View>
              <View>
                <Text className="text-foreground text-sm font-medium">{option.name}</Text>
                <Text className="text-muted-foreground text-xs">{option.estimated}</Text>
              </View>
            </View>
            <Text className="text-foreground text-sm font-semibold">
              {option.price === 0 ? 'Free' : formatCurrency(option.price, 'USD')}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-row gap-3">
        <Button
          variant="outline"
          className="h-12 flex-1 rounded-2xl"
          onPress={() => setStep('address')}>
          <Text>Back</Text>
        </Button>
        <Button className="h-12 flex-1 rounded-2xl" onPress={() => setStep('payment')}>
          <Text className="text-primary-foreground font-semibold">Continue to Payment</Text>
        </Button>
      </View>
    </View>
  );
}

function PaymentStep() {
  const {
    paymentMethods,
    selectedPaymentMethodId,
    selectPaymentMethod,
    addPaymentMethod,
    setStep,
    setLoading,
  } = useCheckoutStore();
  const { cartItems, cartTotalCents, clearCart } = useCart();
  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoadingLocal] = React.useState(false);

  const addresses = useCheckoutStore((s) => s.addresses);
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId);
  const shippingMethod = useCheckoutStore((s) => s.shippingMethod);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const shippingCents = shippingMethod === 'express' ? 999 : 0;
  const taxCents = Math.round(cartTotalCents * 0.08);
  const totalCents = cartTotalCents + shippingCents + taxCents;

  const handleAddCard = () => {
    const newCard = {
      id: `card_${Date.now()}`,
      type: 'card' as const,
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
    };
    addPaymentMethod(newCard);
    setShowForm(false);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setLoadingLocal(true);
    setLoading(true);
    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          priceCents: item.priceCents,
          variantId: item.variantId,
        })),
        addressId: selectedAddressId,
        shippingMethod,
        paymentMethodId: selectedPaymentMethodId,
      };

      const res = await api.post('/user/orders', payload);
      if (res.orderId) {
        await clearCart();
        useCheckoutStore.getState().reset();
        router.replace('/(user)/orders');
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoadingLocal(false);
      setLoading(false);
    }
  };

  if (showForm) {
    return (
      <View className="gap-4">
        <Text className="text-foreground text-base font-semibold">Add Payment Method</Text>
        <View className="bg-card shadow-card gap-4 rounded-2xl p-4">
          <View className="gap-2">
            <Text className="text-muted-foreground text-xs">Card Number</Text>
            <Input placeholder="4242 4242 4242 4242" keyboardType="number-pad" />
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1 gap-2">
              <Text className="text-muted-foreground text-xs">Expiry</Text>
              <Input placeholder="MM/YY" keyboardType="number-pad" />
            </View>
            <View className="flex-1 gap-2">
              <Text className="text-muted-foreground text-xs">CVV</Text>
              <Input placeholder="123" keyboardType="number-pad" secureTextEntry />
            </View>
          </View>
        </View>
        <View className="flex-row gap-3">
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-2xl"
            onPress={() => setShowForm(false)}>
            <Text>Cancel</Text>
          </Button>
          <Button className="h-12 flex-1 rounded-2xl" onPress={handleAddCard}>
            <Text className="text-primary-foreground">Save Card</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-foreground text-base font-semibold">Payment Method</Text>
        <Button variant="ghost" size="sm" onPress={() => setShowForm(true)}>
          <Icon as={Plus} size={16} className="text-primary" />
          <Text className="text-primary text-sm">Add Card</Text>
        </Button>
      </View>

      {paymentMethods.length === 0 ? (
        <View className="bg-card shadow-card items-center gap-3 rounded-2xl p-6">
          <Icon as={CreditCard} size={32} className="text-muted-foreground" />
          <Text className="text-muted-foreground text-sm">No payment methods</Text>
          <Button variant="outline" size="sm" onPress={() => setShowForm(true)}>
            <Text>Add a Card</Text>
          </Button>
        </View>
      ) : (
        <View className="gap-3">
          {paymentMethods.map((method) => (
            <Pressable
              key={method.id}
              onPress={() => selectPaymentMethod(method.id)}
              className={`rounded-2xl border p-4 ${
                selectedPaymentMethodId === method.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              }`}>
              <View className="flex-row items-center gap-3">
                {selectedPaymentMethodId === method.id ? (
                  <Icon as={CircleDot} size={20} className="text-primary" />
                ) : (
                  <Icon as={Circle} size={20} className="text-muted-foreground" />
                )}
                <View className="flex-1">
                  <Text className="text-foreground text-sm font-medium">
                    {method.brand} •••• {method.last4}
                  </Text>
                  <Text className="text-muted-foreground text-xs">
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable
        onPress={() => selectPaymentMethod('cod')}
        className={`rounded-2xl border p-4 ${
          selectedPaymentMethodId === 'cod'
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card'
        }`}>
        <View className="flex-row items-center gap-3">
          {selectedPaymentMethodId === 'cod' ? (
            <Icon as={CircleDot} size={20} className="text-primary" />
          ) : (
            <Icon as={Circle} size={20} className="text-muted-foreground" />
          )}
          <Icon as={Banknote} size={20} className="text-muted-foreground" />
          <Text className="text-foreground text-sm font-medium">Cash on Delivery</Text>
        </View>
      </Pressable>

      {selectedAddress && (
        <View className="bg-card shadow-card gap-3 rounded-2xl p-4">
          <Text className="text-muted-foreground text-xs">Delivering to</Text>
          <Text className="text-foreground text-sm font-medium">{selectedAddress.name}</Text>
          <Text className="text-muted-foreground text-sm">
            {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state}{' '}
            {selectedAddress.zip}
          </Text>
        </View>
      )}

      <View className="bg-card shadow-card gap-3 rounded-2xl p-4">
        <Text className="text-foreground text-base font-semibold">Order Summary</Text>
        <View className="gap-2">
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

      <View className="flex-row gap-3">
        <Button
          variant="outline"
          className="h-12 flex-1 rounded-2xl"
          onPress={() => setStep('shipping')}>
          <Text>Back</Text>
        </Button>
        <Button
          className="h-12 flex-1 rounded-2xl"
          disabled={!selectedPaymentMethodId || loading}
          onPress={handlePlaceOrder}>
          <Text className="text-primary-foreground font-semibold">
            {loading ? 'Processing...' : 'Place Order'}
          </Text>
        </Button>
      </View>
    </View>
  );
}

export default function CheckoutScreen() {
  const { currentStep } = useCheckoutStore();

  const renderStep = () => {
    switch (currentStep) {
      case 'address':
        return <AddressStep />;
      case 'shipping':
        return <ShippingStep />;
      case 'payment':
        return <PaymentStep />;
    }
  };

  return (
    <AuthGuard>
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
          {renderStep()}
        </ScrollView>
      </View>
    </AuthGuard>
  );
}
