import React, { useEffect, useState, useCallback } from 'react';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/money';
import { TrendingUp, Package, ShoppingCart, DollarSign, BarChart3 } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

export default function AnalyticsScreen() {
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading analytics...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="p-4 gap-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} />}>
        <Text variant="h2" className="font-bold">Analytics</Text>

        <View className="flex-row flex-wrap gap-4">
          <Card className="min-w-[150px] flex-1 p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={Package} size={20} className="text-primary" />
              <Text className="text-sm font-medium">Products</Text>
            </View>
            <Text variant="h3" className="font-bold">{stats?.totalProducts ?? 0}</Text>
          </Card>

          <Card className="min-w-[150px] flex-1 p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={ShoppingCart} size={20} className="text-primary" />
              <Text className="text-sm font-medium">Orders</Text>
            </View>
            <Text variant="h3" className="font-bold">{stats?.totalOrders ?? 0}</Text>
          </Card>

          <Card className="min-w-[150px] flex-1 p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={DollarSign} size={20} className="text-primary" />
              <Text className="text-sm font-medium">Revenue</Text>
            </View>
            <Text variant="h3" className="font-bold">
              {formatCurrency(Math.round(parseFloat(stats?.totalRevenue || '0') * 100))}
            </Text>
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
        </View>

        <Card className="p-4 gap-2">
          <View className="flex-row items-center gap-2">
            <Icon as={BarChart3} size={20} className="text-muted-foreground" />
            <Text className="font-semibold">Performance Summary</Text>
          </View>
          <View className="mt-2 gap-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">Avg revenue per order</Text>
              <Text className="text-sm font-medium">
                {stats?.totalOrders && stats?.totalOrders > 0
                  ? formatCurrency(Math.round((parseFloat(stats?.totalRevenue || '0') / stats.totalOrders) * 100))
                  : '$0.00'}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">Low stock items</Text>
              <Text className="text-sm font-medium">{stats?.lowStockCount ?? 0}</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
