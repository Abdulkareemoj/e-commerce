import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/lib/authStore';
import { Button } from '@/components/ui/button';
import { Link } from 'expo-router';

export default function NotificationsScreen() {
  const { isAuthenticated, user, isLoading, initializeAuth } = useAuthStore();

  React.useEffect(() => {
    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'user') {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-center mb-4">You must be signed in to view notifications.</Text>
        <Link href="/(auth)/sign-in" asChild><Button variant="default"><Text>Sign In</Text></Button></Link>
      </View>
    );
  }

  // Placeholder for real notifications from backend
  const notifications = [
    { id: '1', title: 'Order Shipped', message: 'Your order ORD-1002 has been shipped!', date: '2 hours ago' },
    { id: '2', title: 'Welcome!', message: 'Thanks for joining our marketplace.', date: '2 days ago' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="border-b border-border p-4">
        <Text variant="h2" className="font-bold">
          Notifications
        </Text>
      </View>
      <ScrollView contentContainerClassName="p-4 gap-4">
        {notifications.map(n => (
          <View key={n.id} className="p-4 bg-card border border-border rounded-lg">
            <View className="flex-row justify-between mb-1">
              <Text className="font-semibold text-base">{n.title}</Text>
              <Text className="text-xs text-muted-foreground">{n.date}</Text>
            </View>
            <Text className="text-sm text-muted-foreground">{n.message}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
