import React, { useEffect, useState, useCallback } from 'react';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { View, ScrollView, RefreshControl } from 'react-native';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/money';
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
} from 'lucide-react-native';

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
