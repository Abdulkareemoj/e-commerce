import React, { useEffect, useState, useCallback } from 'react';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/money';
import { TrendingUp, Package, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react-native';

export default function DashboardScreen() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/vendor/dashboard/stats');
      setStats(res.stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="p-4 gap-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Text variant="h2" className="font-bold">
          Dashboard
        </Text>

        <View className="flex-row flex-wrap gap-4">
          <Card className="min-w-[150px] flex-1 p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={Package} size={20} className="text-primary" />
              <Text className="text-sm font-medium">Products</Text>
            </View>
            <Text variant="h3" className="font-bold">
              {stats?.totalProducts ?? 0}
            </Text>
            <Text className="text-xs text-muted-foreground">Active listings</Text>
          </Card>

          <Card className="min-w-[150px] flex-1 p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={ShoppingCart} size={20} className="text-primary" />
              <Text className="text-sm font-medium">Orders</Text>
            </View>
            <Text variant="h3" className="font-bold">
              {stats?.totalOrders ?? 0}
            </Text>
            <Text className="text-xs text-muted-foreground">All time</Text>
          </Card>

          <Card className="min-w-[150px] flex-1 p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={DollarSign} size={20} className="text-primary" />
              <Text className="text-sm font-medium">Revenue</Text>
            </View>
            <Text variant="h3" className="font-bold">
              {formatCurrency(Math.round(parseFloat(stats?.totalRevenue || '0') * 100))}
            </Text>
            <Text className="text-xs text-muted-foreground">Last 30 days</Text>
          </Card>

          <Card className="min-w-[150px] flex-1 p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={TrendingUp} size={20} className="text-primary" />
              <Text className="text-sm font-medium">Growth</Text>
            </View>
            <Text
              variant="h3"
              className={`font-bold ${(stats?.revenueGrowth ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats?.revenueGrowth ?? 0}%
            </Text>
            <Text className="text-xs text-muted-foreground">vs last month</Text>
          </Card>

          {(stats?.lowStockCount ?? 0) > 0 && (
            <Card className="w-full border-destructive/30 p-4">
              <View className="flex-row items-center gap-2">
                <Icon as={AlertTriangle} size={20} className="text-destructive" />
                <Text className="text-sm font-medium text-destructive">
                  {stats.lowStockCount} product{stats.lowStockCount > 1 ? 's' : ''} low on stock
                </Text>
              </View>
            </Card>
          )}
        </View>

        <View className="gap-4">
          <Text variant="large" className="font-semibold">
            Recent Orders
          </Text>
          {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <Card className="p-4">
              <Text className="text-sm text-muted-foreground">No orders yet.</Text>
            </Card>
          ) : (
            stats.recentOrders.map((order: any) => (
              <Card key={order.id} className="p-4">
                <View className="flex-row items-center justify-between">
                  <View className="gap-1">
                    <Text className="text-sm font-medium">Order #{order.id.slice(0, 8)}</Text>
                    <Text className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} -{' '}
                      {formatCurrency(Math.round(parseFloat(order.totalAmount || '0') * 100))}
                    </Text>
                  </View>
                  <Badge variant="outline">
                    <Text className="text-xs capitalize">{order.status}</Text>
                  </Badge>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
