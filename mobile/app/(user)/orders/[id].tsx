import { Text } from '@/components/ui/text';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center p-4">
        <Text variant="h2" className="mb-4">
          Order Detail
        </Text>
        <Text className="text-center text-muted-foreground">Details for Order ID: {id}</Text>
      </View>
    </SafeAreaView>
  );
}
