import React, { useEffect, useState, useCallback } from 'react';
import { Text } from '@/components/ui/text';
import { View, ScrollView, RefreshControl } from 'react-native';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/money';
import { BarChart } from '@/components/ui/bar-chart';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package, ShoppingCart, DollarSign, BarChart3, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-500',
  accepted: 'text-blue-500',
  shipped: 'text-purple-500',
  delivered: 'text-green-500',
  cancelled: 'text-red-500',
};

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

  const chartData = (stats?.revenueChart || []).map((d: any) => ({
    label: d.label || '',
    value: parseFloat(d.revenue || '0'),
  }));

  const orderColumns: ColumnDef<any>[] = [
    {
      id: 'id',
      header: 'Order ID',
      accessorKey: 'id',
      cell: ({ getValue }) => <Text className="font-mono text-xs">#{(getValue() as string).slice(0, 8)}</Text>,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const s = getValue() as string;
        return (
          <Badge variant="outline" className="capitalize">
            <Text className="text-xs">{s}</Text>
          </Badge>
        );
      },
    },
    {
      id: 'totalAmount',
      header: 'Amount',
      accessorKey: 'totalAmount',
      cell: ({ getValue }) => (
        <Text className="font-semibold">{formatCurrency(Math.round(parseFloat(getValue() || '0') * 100))}</Text>
      ),
    },
    {
      id: 'createdAt',
      header: 'Date',
      accessorKey: 'createdAt',
      cell: ({ getValue }) => (
        <Text className="text-muted-foreground text-xs">
          {new Date(getValue() as string).toLocaleDateString()}
        </Text>
      ),
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className="text-muted-foreground">Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <ScrollView
        contentContainerClassName="p-4 gap-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchStats(); }}
          />
        }>
        <Text variant="h2" className="font-bold">Analytics</Text>

        <View className="flex-row flex-wrap gap-4">
          <View className="bg-card min-w-[150px] flex-1 rounded-2xl p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={Package} size={20} className="text-primary" />
              <Text className="text-muted-foreground text-sm font-medium">Products</Text>
            </View>
            <Text variant="h3" className="font-bold">{stats?.totalProducts ?? 0}</Text>
          </View>
          <View className="bg-card min-w-[150px] flex-1 rounded-2xl p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={ShoppingCart} size={20} className="text-primary" />
              <Text className="text-muted-foreground text-sm font-medium">Orders</Text>
            </View>
            <Text variant="h3" className="font-bold">{stats?.totalOrders ?? 0}</Text>
          </View>
          <View className="bg-card min-w-[150px] flex-1 rounded-2xl p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={DollarSign} size={20} className="text-primary" />
              <Text className="text-muted-foreground text-sm font-medium">Revenue</Text>
            </View>
            <Text variant="h3" className="font-bold">
              {formatCurrency(Math.round(parseFloat(stats?.totalRevenue || '0') * 100))}
            </Text>
          </View>
          <View className="bg-card min-w-[150px] flex-1 rounded-2xl p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={TrendingUp} size={20} className="text-primary" />
              <Text className="text-muted-foreground text-sm font-medium">Growth</Text>
            </View>
            <Text
              variant="h3"
              className={`font-bold ${(stats?.revenueGrowth ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats?.revenueGrowth ?? 0}%
            </Text>
            <Text className="text-muted-foreground text-xs">vs last month</Text>
          </View>
        </View>

        {chartData.length > 0 && (
          <View className="bg-card rounded-2xl p-4">
            <View className="mb-3 flex-row items-center gap-2">
              <Icon as={BarChart3} size={18} className="text-primary" />
              <Text className="font-semibold">Revenue (7 days)</Text>
            </View>
            <BarChart data={chartData} height={140} />
          </View>
        )}

        <View className="bg-card rounded-2xl p-4">
          <View className="mb-2 flex-row items-center gap-2">
            <Icon as={BarChart3} size={18} className="text-muted-foreground" />
            <Text className="font-semibold">Performance Summary</Text>
          </View>
          <View className="mt-2 gap-2">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground text-sm">Avg revenue per order</Text>
              <Text className="text-sm font-medium">
                {stats?.totalOrders && stats?.totalOrders > 0
                  ? formatCurrency(Math.round((parseFloat(stats?.totalRevenue || '0') / stats.totalOrders) * 100))
                  : '$0.00'}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground text-sm">Low stock items</Text>
              <Text className="text-sm font-medium">{stats?.lowStockCount ?? 0}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground text-sm">Revenue growth</Text>
              <Text className={`text-sm font-medium ${(stats?.revenueGrowth ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats?.revenueGrowth ?? 0}%
              </Text>
            </View>
          </View>
        </View>

        {stats?.recentOrders && stats.recentOrders.length > 0 && (
          <View className="gap-2">
            <Text className="font-semibold">Recent Orders</Text>
            <DataTable
              columns={orderColumns}
              data={stats.recentOrders}
              pageSize={5}
              toolbar
              filterColumn="id"
              filterPlaceholder="Filter by Order ID..."
              facetedFilters={[
                {
                  column: 'status',
                  title: 'Status',
                  options: [
                    { label: 'Pending', value: 'pending' },
                    { label: 'Accepted', value: 'accepted' },
                    { label: 'Shipped', value: 'shipped' },
                    { label: 'Delivered', value: 'delivered' },
                    { label: 'Cancelled', value: 'cancelled' },
                  ],
                },
              ]}
            />
          </View>
        )}

        {stats?.recentActivity && stats.recentActivity.length > 0 && (
          <View className="bg-card rounded-2xl p-4">
            <Text className="mb-3 font-semibold">Activity</Text>
            <View className="gap-2">
              {stats.recentActivity.slice(0, 8).map((act: any, i: number) => {
                const StatusIcon = getStatusIcon(act.status);
                const statusColor = STATUS_COLORS[act.status] || 'text-muted-foreground';
                return (
                  <View key={act.id || i} className="flex-row items-center gap-3 border-b border-gray-100 py-2 last:border-b-0">
                    <Icon as={StatusIcon} size={14} className={statusColor} />
                    <View className="flex-1">
                      <Text className="text-sm">{act.message}</Text>
                    </View>
                    <Text className="text-muted-foreground text-xs">
                      {new Date(act.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
