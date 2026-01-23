import React from 'react';
import { Text } from '@/components/ui/text';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-4">
        <Text variant="h2" className="mb-4 font-bold">
          Manage Products
        </Text>
        <Text>Product moderation and management interface will go here.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
