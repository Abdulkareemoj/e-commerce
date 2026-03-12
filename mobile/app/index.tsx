import * as React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/lib/authStore';

export default function Index() {
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

  // Public landing: show general content; authenticated users get role-based quick links
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Welcome to the Marketplace
      </Text>
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 24 }}>
        Browse products, manage your store, or explore your dashboard.
      </Text>

      {isAuthenticated && user ? (
        <View style={{ gap: 12 }}>
          {user.role === 'admin' && <Redirect href="/(admin)/(tabs)/dashboard" />}
          {user.role === 'vendor' && <Redirect href="/(vendor)/(tabs)/dashboard" />}
          {user.role === 'user' && <Redirect href="/(user)/(tabs)/home" />}
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <Redirect href="/(user)/(tabs)/home" />
        </View>
      )}
    </View>
  );
}
