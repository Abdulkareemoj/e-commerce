import { Text } from '@/components/ui/text';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentMethodsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center p-4">
        <Text variant="h2" className="mb-4">
          Payment Methods
        </Text>
        <Text className="text-center text-muted-foreground">Manage saved payment methods.</Text>
      </View>
    </SafeAreaView>
  );
}
