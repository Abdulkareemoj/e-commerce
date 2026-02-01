import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/lib/authStore';

export default function Index() {
  const { colorScheme } = useColorScheme();
  const { user, isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  React.useEffect(() => {
    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 1. If not logged in, go to Auth group
  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // 2. If logged in, redirect based on role
  switch (user.role) {
    case 'admin':
      return <Redirect href="/(admin)/(tabs)/dashboard" />;
    case 'vendor':
      return <Redirect href="/(vendor)/(tabs)/dashboard" />;
    case 'user':
    default:
      return <Redirect href="/(user)/(tabs)/home" />;
  }
}
