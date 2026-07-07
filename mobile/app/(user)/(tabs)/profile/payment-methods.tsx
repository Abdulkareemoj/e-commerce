import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { CreditCard } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

export default function PaymentMethodsScreen() {
  return (
    <View className="bg-background flex-1">
      <View className="bg-card border-border items-center justify-center border-b px-5 py-4">
        <Text className="text-foreground text-lg font-bold">Payment Methods</Text>
      </View>
      <View className="flex-1 items-center justify-center gap-4 p-4">
        <View className="bg-primary/10 size-16 items-center justify-center rounded-full">
          <Icon as={CreditCard} size={32} className="text-primary" />
        </View>
        <Text className="text-foreground text-lg font-bold">Payment Methods</Text>
        <Text className="text-muted-foreground text-center">Manage saved payment methods.</Text>
      </View>
    </View>
  );
}
