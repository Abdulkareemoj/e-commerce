import React, { useEffect, useState, useCallback } from 'react';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { View, ScrollView, RefreshControl, Pressable, Platform } from 'react-native';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/money';
import { useRouter } from 'expo-router';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  BarChart3,
} from 'lucide-react-native';

// Chart component - will render a simple bar chart without victory-native for now
// since victory-native requires native modules that may not work in all environments
function RevenueChart({ data }: { data: { date: string; amount: number }[] }) {
  if (!data || data.length === 0) return null;

  const maxAmount = Math.max(...data.map((d) => d.amount));
  const chartHeight = 150;

  return (
    <View className="bg-card shadow-card rounded-2xl p-4">
      <Text className="text-foreground mb-3 font-semibold">Revenue Trend</Text>
      <View style={{ height: chartHeight }} className="flex-row items-end justify-between gap-2">
        {data.slice(-7).map((item, index) => {
          const barHeight = maxAmount > 0 ? (item.amount / maxAmount) * (chartHeight - 30) : 0;
          return (
            <View key={index} className="flex-1 items-center gap-1">
              <Text className="text-muted-foreground text-xs">
                ${Math.round(item.amount / 100)}
              </Text>
              <View
                className="bg-primary/80 w-full rounded-t-md"
                style={{ height: Math.max(barHeight, 4) }}
              />
              <Text className="text-muted-foreground text-xs">
                {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-amber-500';
    }
  };

  // Generate mock revenue chart data if not provided by API
  const revenueChartData = stats?.revenueChart || [
    { date: '2024-01-01', amount: 120000 },
    { date: '2024-01-02', amount: 180000 },
    { date: '2024-01-03', amount: 95000 },
    { date: '2024-01-04', amount: 210000 },
    { date: '2024-01-05', amount: 165000 },
    { date: '2024-01-06', amount: 240000 },
    { date: '2024-01-07', amount: 195000 },
  ];

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className="text-muted-foreground">Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <ScrollView
        contentContainerClassName="p-4 gap-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text variant="h2" className="text-foreground font-bold">
              Dashboard
            </Text>
            <Text className="text-muted-foreground text-sm">Welcome back, vendor!</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-3">
          <View className="bg-card shadow-card min-w-[140px] flex-1 rounded-2xl p-4">
            <View className="bg-primary/10 mb-3 size-10 items-center justify-center rounded-xl">
              <Icon as={Package} size={20} className="text-primary" />
            </View>
            <Text className="text-foreground text-2xl font-bold">{stats?.totalProducts ?? 0}</Text>
            <Text className="text-muted-foreground text-xs">Products</Text>
          </View>

          <View className="bg-card shadow-card min-w-[140px] flex-1 rounded-2xl p-4">
            <View className="bg-primary/10 mb-3 size-10 items-center justify-center rounded-xl">
              <Icon as={ShoppingCart} size={20} className="text-primary" />
            </View>
            <Text className="text-foreground text-2xl font-bold">{stats?.totalOrders ?? 0}</Text>
            <Text className="text-muted-foreground text-xs">Orders</Text>
          </View>

          <View className="bg-card shadow-card min-w-[140px] flex-1 rounded-2xl p-4">
            <View className="bg-primary/10 mb-3 size-10 items-center justify-center rounded-xl">
              <Icon as={DollarSign} size={20} className="text-primary" />
            </View>
            <Text className="text-foreground text-lg font-bold">
              {formatCurrency(Math.round(parseFloat(stats?.totalRevenue || '0') * 100))}
            </Text>
            <Text className="text-muted-foreground text-xs">Revenue</Text>
          </View>

          <View className="bg-card shadow-card min-w-[140px] flex-1 rounded-2xl p-4">
            <View className="bg-primary/10 mb-3 size-10 items-center justify-center rounded-xl">
              <Icon as={TrendingUp} size={20} className="text-primary" />
            </View>
            <Text
              className={`text-lg font-bold ${(stats?.revenueGrowth ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats?.revenueGrowth ?? 0}%
            </Text>
            <Text className="text-muted-foreground text-xs">Growth</Text>
          </View>
        </View>

        <RevenueChart data={revenueChartData} />

        {(stats?.lowStockCount ?? 0) > 0 && (
          <View className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <View className="flex-row items-center gap-3">
              <View className="size-10 items-center justify-center rounded-xl bg-amber-100">
                <Icon as={AlertTriangle} size={20} className="text-amber-600" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-amber-800">Low Stock Alert</Text>
                <Text className="text-xs text-amber-600">
                  {stats.lowStockCount} product{stats.lowStockCount > 1 ? 's' : ''} need attention
                </Text>
              </View>
              <Icon as={ArrowUpRight} size={16} className="text-amber-600" />
            </View>
          </View>
        )}

        <View className="bg-card shadow-card rounded-2xl p-4">
          <Text className="text-foreground mb-3 font-semibold">Quick Actions</Text>
          <View className="gap-2">
            <Pressable
              onPress={() => router.push('/(vendor)/(tabs)/products')}
              className="bg-secondary/50 flex-row items-center justify-between rounded-xl p-3">
              <View className="flex-row items-center gap-3">
                <Icon as={Plus} size={18} className="text-primary" />
                <Text className="text-foreground text-sm font-medium">Add New Product</Text>
              </View>
              <Icon as={ArrowUpRight} size={14} className="text-muted-foreground" />
            </Pressable>
            <Pressable
              onPress={() => router.push('/(vendor)/(tabs)/inventory')}
              className="bg-secondary/50 flex-row items-center justify-between rounded-xl p-3">
              <View className="flex-row items-center gap-3">
                <Icon as={Package} size={18} className="text-primary" />
                <Text className="text-foreground text-sm font-medium">Manage Inventory</Text>
              </View>
              <Icon as={ArrowUpRight} size={14} className="text-muted-foreground" />
            </Pressable>
            <Pressable
              onPress={() => router.push('/(vendor)/analytics')}
              className="bg-secondary/50 flex-row items-center justify-between rounded-xl p-3">
              <View className="flex-row items-center gap-3">
                <Icon as={BarChart3} size={18} className="text-primary" />
                <Text className="text-foreground text-sm font-medium">View Analytics</Text>
              </View>
              <Icon as={ArrowUpRight} size={14} className="text-muted-foreground" />
            </Pressable>
          </View>
        </View>

        <View className="gap-3">
          <Text variant="large" className="text-foreground font-semibold">
            Recent Orders
          </Text>
          {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <View className="bg-card shadow-card rounded-2xl p-6">
              <Text className="text-muted-foreground text-center text-sm">No orders yet</Text>
            </View>
          ) : (
            stats.recentOrders.map((order: any) => {
              const StatusIcon = getStatusIcon(order.status);
              const statusColor = getStatusColor(order.status);
              return (
                <View key={order.id} className="bg-card shadow-card rounded-2xl p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="bg-secondary size-10 items-center justify-center rounded-xl">
                        <Icon as={StatusIcon} size={18} className={statusColor} />
                      </View>
                      <View className="gap-1">
                        <Text className="text-foreground text-sm font-semibold">
                          Order #{order.id.slice(0, 8)}
                        </Text>
                        <Text className="text-muted-foreground text-xs">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end gap-1">
                      <Text className="text-foreground text-sm font-bold">
                        {formatCurrency(Math.round(parseFloat(order.totalAmount || '0') * 100))}
                      </Text>
                      <Badge variant="outline" className="capitalize">
                        <Text className="text-xs">{order.status}</Text>
                      </Badge>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
