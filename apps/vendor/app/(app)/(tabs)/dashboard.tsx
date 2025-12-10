import React from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Package, ShoppingCart, DollarSign } from 'lucide-react-native';

export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-4 gap-6">
        <Text variant="h2" className="font-bold">
          Dashboard
        </Text>

        {/* Stats Cards */}
        <View className="flex-row flex-wrap gap-4">
          <View className="min-w-[150px] flex-1 rounded-lg border bg-card p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={Package} size={20} className="text-primary" />
              <Text className="text-sm font-medium">Products</Text>
            </View>
            <Text variant="h3" className="font-bold">
              24
            </Text>
            <Text className="text-xs text-muted-foreground">Active listings</Text>
          </View>

          <View className="min-w-[150px] flex-1 rounded-lg border bg-card p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={ShoppingCart} size={20} className="text-primary" />
              <Text className="text-sm font-medium">Orders</Text>
            </View>
            <Text variant="h3" className="font-bold">
              156
            </Text>
            <Text className="text-xs text-muted-foreground">This month</Text>
          </View>

          <View className="min-w-[150px] flex-1 rounded-lg border bg-card p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={DollarSign} size={20} className="text-primary" />
              <Text className="text-sm font-medium">Revenue</Text>
            </View>
            <Text variant="h3" className="font-bold">
              $12,450
            </Text>
            <Text className="text-xs text-muted-foreground">This month</Text>
          </View>

          <View className="min-w-[150px] flex-1 rounded-lg border bg-card p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={TrendingUp} size={20} className="text-primary" />
              <Text className="text-sm font-medium">Growth</Text>
            </View>
            <Text variant="h3" className="font-bold">
              +23%
            </Text>
            <Text className="text-xs text-muted-foreground">vs last month</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="gap-4">
          <Text variant="large" className="font-semibold">
            Recent Activity
          </Text>
          <View className="rounded-lg border bg-card p-4">
            <Text className="text-sm">New order received - Order #1234</Text>
            <Text className="mt-1 text-xs text-muted-foreground">2 hours ago</Text>
          </View>
          <View className="rounded-lg border bg-card p-4">
            <Text className="text-sm">Product "Wireless Headphones" sold out</Text>
            <Text className="mt-1 text-xs text-muted-foreground">1 day ago</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
