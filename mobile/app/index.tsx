import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';

export default function Index() {
  const { colorScheme } = useColorScheme();
  // TODO: Hook this up to your actual Auth Context
  // const { user, isLoading, role } = useAuth();

  // MOCK DATA FOR SETUP
  const isLoading = false;
  const user: { id: number } | null = null; // Set to { id: 1 } to test logged in state
  const role: 'admin' | 'vendor' | 'customer' = 'customer' as const;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 1. If not logged in, go to Auth group
  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // 2. If logged in, redirect based on role
  switch (role) {
    case 'admin':
      return <Redirect href="/(admin)/(tabs)/dashboard" />;
    case 'vendor':
      return <Redirect href="/(vendor)/(tabs)/dashboard" />;
    case 'customer':
    default:
      return <Redirect href="/(user)/(tabs)/home" />;
  }
}
