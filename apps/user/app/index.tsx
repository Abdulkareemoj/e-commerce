import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

const routes = [
  { path: '/(app)/cart', name: 'Cart' },
  { path: '/(app)/catalog', name: 'Catalog' },
  { path: '/(app)/favorites', name: 'Favorites' },
  { path: '/(app)/home', name: 'Home' },
  { path: '/(app)/messages', name: 'Messages' },
  { path: '/(app)/messages/1', name: 'Message with id: 1' },
  { path: '/(app)/orders', name: 'Orders' },
  { path: '/(app)/orders/1', name: 'Order with id: 1' },
  { path: '/(app)/product/1', name: 'Product with id: 1' },
  { path: '/(app)/profile', name: 'Profile' },
  { path: '/(app)/profile/addresses', name: 'Addresses' },
  { path: '/(app)/profile/payment-methods', name: 'Payment Methods' },
  { path: '/(app)/profile/settings', name: 'Settings' },
  { path: '/(app)/profile/support', name: 'Support' },
  { path: '/(auth)/forgot-password', name: 'Forgot Password' },
  { path: '/(auth)/reset-password', name: 'Reset Password' },
  { path: '/(auth)/sign-in', name: 'Sign In' },
  { path: '/(auth)/sign-up', name: 'Sign Up' },
  { path: '/(auth)/verify-email', name: 'Verify Email' },
];

export default function Index() {
  return (
    <ScrollView className="bg-background">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">App Routes</Text>
        {routes.map((route) => (
          <Link key={route.path} href={route.path} asChild>
            <Button className="mb-2">
              <Text>{route.name}</Text>
            </Button>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}
