import { useState, useEffect } from 'react';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { TrendingUp, Users, Store, Package, ShoppingCart, DollarSign } from 'lucide-react-native';
import { api } from '@/lib/api';
import { BarChart } from '@/components/ui/bar-chart';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';

export default function AnalyticsScreen() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/dashboard/stats')
      .then((res) => setStats(res.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const chartData = (stats?.revenueChart || []).map((d: any) => ({
    label: d.label || '',
    value: parseFloat(d.revenue || '0'),
  }));

  const activityColumns: ColumnDef<any>[] = [
    {
      id: 'message',
      header: 'Event',
      accessorKey: 'message',
      cell: ({ getValue }) => <Text className="text-sm">{getValue() as string}</Text>,
    },
    {
      id: 'type',
      header: 'Type',
      accessorKey: 'type',
      cell: ({ getValue }) => (
        <Text className="text-muted-foreground text-xs capitalize">{getValue() as string}</Text>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const s = getValue() as string;
        return (
          <Text className={`text-xs capitalize ${s === 'delivered' ? 'text-green-500' : s === 'cancelled' ? 'text-red-500' : s === 'pending' ? 'text-amber-500' : 'text-blue-500'}`}>
            {s}
          </Text>
        );
      },
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

  const metrics = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary' },
        { label: 'Active Vendors', value: stats.totalVendors, icon: Store, color: 'text-secondary-foreground' },
        { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-info' },
        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-success' },
        {
          label: 'Total Revenue',
          value: `$${parseFloat(stats.totalRevenue || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          icon: DollarSign,
          color: 'text-warning',
        },
        { label: 'Pending Payouts', value: stats.pendingPayouts, icon: TrendingUp, color: 'text-destructive' },
      ]
    : [];

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="small" className="text-primary" />
        <Text className="text-muted-foreground mt-2 text-sm">Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <ScrollView contentContainerClassName="p-4 gap-6">
        <Text variant="h2" className="font-bold">Analytics</Text>

        <View className="flex-row flex-wrap gap-4">
          {metrics.map((m) => (
            <View key={m.label} className="bg-card border-border min-w-[150px] flex-1 rounded-2xl border p-4">
              <View className="mb-2 flex-row items-center gap-2">
                <View className="bg-primary/10 size-8 items-center justify-center rounded-lg">
                  <Icon as={m.icon} size={16} className={m.color} />
                </View>
                <Text className="text-muted-foreground text-sm font-medium">{m.label}</Text>
              </View>
              <Text className="text-foreground text-2xl font-bold">{m.value}</Text>
            </View>
          ))}
        </View>

        {chartData.length > 0 && (
          <View className="bg-card rounded-2xl p-4">
            <View className="mb-3 flex-row items-center gap-2">
              <Icon as={TrendingUp} size={18} className="text-primary" />
              <Text className="font-semibold">Revenue (7 days)</Text>
            </View>
            <BarChart data={chartData} height={140} />
          </View>
        )}

        <View className="bg-card border-border rounded-2xl border p-4">
          <View className="mb-2 flex-row items-center gap-2">
            <View className="bg-warning/10 size-8 items-center justify-center rounded-lg">
              <Icon as={Users} size={16} className="text-warning" />
            </View>
            <Text className="font-semibold">Pending Vendors</Text>
          </View>
          <Text className="text-foreground text-3xl font-bold">{stats?.pendingVendors ?? 0}</Text>
          <Text className="text-muted-foreground mt-1 text-xs">Awaiting approval</Text>
        </View>

        {stats?.recentActivity && stats.recentActivity.length > 0 && (
          <View className="gap-2">
            <Text className="font-semibold">Recent Activity</Text>
            <DataTable
              columns={activityColumns}
              data={stats.recentActivity}
              pageSize={5}
              toolbar
              filterColumn="message"
              filterPlaceholder="Filter events..."
              facetedFilters={[
                {
                  column: 'type',
                  title: 'Type',
                  options: [
                    { label: 'Order', value: 'order' },
                    { label: 'User', value: 'user' },
                    { label: 'Vendor', value: 'vendor' },
                  ],
                },
                {
                  column: 'status',
                  title: 'Status',
                  options: [
                    { label: 'Pending', value: 'pending' },
                    { label: 'Delivered', value: 'delivered' },
                    { label: 'Cancelled', value: 'cancelled' },
                  ],
                },
              ]}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
