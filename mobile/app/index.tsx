import * as React from 'react';
import { Text } from '@/components/ui/text';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/lib/authStore';

export default function Index() {
  const { user, isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  React.useEffect(() => {
    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    // Unauthenticated: send to guest/user home (read-only browse)
    return <Redirect href="/(user)/(tabs)/home" />;
  }

  // New user who hasn't picked a role yet
  if (!user.onboardingComplete) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  // Role-based routing
  if (user.role === 'admin') {
    return <Redirect href="/(admin)/(tabs)/dashboard" />;
  }

  if (user.role === 'vendor') {
    // Vendor awaiting admin approval
    if (user.vendorStatus === 'pending') {
      return <Redirect href="/(vendor)/pending" />;
    }
    // Vendor whose application was rejected
    if (user.vendorStatus === 'rejected') {
      return <Redirect href="/(vendor)/rejected" />;
    }
    // Approved vendor
    return <Redirect href="/(vendor)/(tabs)/dashboard" />;
  }

  // Default: regular user
  return <Redirect href="/(user)/(tabs)/home" />;
}
