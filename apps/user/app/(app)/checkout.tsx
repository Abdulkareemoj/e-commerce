import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { CheckCircle, MapPin, Truck, CreditCard } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Separator } from '@/components/ui/separator';

// Mock Checkout Steps
const CHECKOUT_STEPS: {
  id: number;
  name: string;
  icon: any;
  status: 'complete' | 'active' | 'pending';
}[] = [
  { id: 1, name: 'Address', icon: MapPin, status: 'complete' },
  { id: 2, name: 'Shipping', icon: Truck, status: 'active' },
  { id: 3, name: 'Payment', icon: CreditCard, status: 'pending' },
];

// --- Components ---

function StepIndicator({ step }: { step: (typeof CHECKOUT_STEPS)[0] }) {
  const statusClasses = {
    complete: 'bg-primary',
    active: 'bg-secondary border-2 border-primary',
    pending: 'bg-muted/50',
  };
  const iconColor = step.status === 'complete' ? 'text-primary-foreground' : 'text-foreground';

  return (
    <View className="flex-1 flex-col items-center">
      <View
        className={`size-10 items-center justify-center rounded-full ${statusClasses[step.status]}`}>
        <Icon as={step.icon} size={20} className={iconColor} />
      </View>
      <Text
        className={`mt-1 text-center text-xs ${step.status === 'active' ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
        {step.name}
      </Text>
    </View>
  );
}

export default function CheckoutScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="border-b border-border p-4">
        <Text variant="h2" className="font-bold">
          Checkout
        </Text>
      </View>
      <ScrollView contentContainerClassName="p-4 gap-6">
        {/* Step Indicator */}
        <Card className="p-4">
          <View className="flex-row justify-between">
            {CHECKOUT_STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <StepIndicator step={step} />
                {index < CHECKOUT_STEPS.length - 1 && (
                  <View className="mt-5 h-0.5 flex-1 bg-border" />
                )}
              </React.Fragment>
            ))}
          </View>
        </Card>

        {/* Current Step Content (Shipping Placeholder) */}
        <Card className="gap-4 p-6">
          <Text variant="h3" className="font-bold">
            Shipping Method
          </Text>
          <Text className="text-muted-foreground">
            Please select your preferred shipping option for this order.
          </Text>
          <Button className="w-full">
            <Text>Continue to Payment</Text>
          </Button>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
