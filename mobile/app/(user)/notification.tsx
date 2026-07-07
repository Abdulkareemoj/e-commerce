import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { AuthGuard } from '@/components/AuthGuard';
import { Bell } from 'lucide-react-native';

export default function NotificationsScreen() {
  return (
    <AuthGuard icon={Bell} message="Sign in to view your notifications." requiredRole="user">
      <View className="bg-background flex-1">
        <View className="border-border border-b p-4">
          <Text variant="h2" className="font-bold">
            Notifications
          </Text>
        </View>
        <ScrollView contentContainerClassName="flex-1 items-center justify-center p-6 gap-4">
          <Icon as={Bell} size={40} className="text-muted-foreground" />
          <Text className="text-muted-foreground text-center">No notifications yet.</Text>
        </ScrollView>
      </View>
    </AuthGuard>
  );
}
