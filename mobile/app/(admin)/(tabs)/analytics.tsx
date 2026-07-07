import { useState, useEffect } from 'react';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { TrendingUp, Users, Store, Package, ShoppingCart, DollarSign } from 'lucide-react-native';
import { api } from '@/lib/api';

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

  const ICON_COLORS: Record<string, string> = {
    Users: 'text-primary',
    Store: 'text-secondary-foreground',
    Package: 'text-info',
    ShoppingCart: 'text-success',
    DollarSign: 'text-warning',
    TrendingUp: 'text-destructive',
  };

  const metrics = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary' },
        {
          label: 'Active Vendors',
          value: stats.totalVendors,
          icon: Store,
          color: 'text-secondary-foreground',
        },
        { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-info' },
        {
          label: 'Total Orders',
          value: stats.totalOrders,
          icon: ShoppingCart,
          color: 'text-success',
        },
        {
          label: 'Total Revenue',
          value: `$${parseFloat(stats.totalRevenue || '0').toLocaleString()}`,
          icon: DollarSign,
          color: 'text-warning',
        },
        {
          label: 'Pending Payouts',
          value: stats.pendingPayouts,
          icon: TrendingUp,
          color: 'text-destructive',
        },
      ]
    : [];

  return (
    <View className="bg-background flex-1">
      <ScrollView contentContainerClassName="p-4 gap-6">
        {loading ? (
          <ActivityIndicator className="mt-8" color="hsl(var(--primary))" />
        ) : (
          <>
            <View className="flex-row flex-wrap gap-4">
              {metrics.map((m) => (
                <View
                  key={m.label}
                  className="bg-card border-border min-w-[150px] flex-1 rounded-2xl border p-4">
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

            <View className="bg-card border-border rounded-2xl border p-4">
              <View className="mb-2 flex-row items-center gap-2">
                <View className="bg-warning/10 size-8 items-center justify-center rounded-lg">
                  <Icon as={Users} size={16} className="text-warning" />
                </View>
                <Text className="text-foreground font-semibold">Pending Vendors</Text>
              </View>
              <Text className="text-foreground text-3xl font-bold">
                {stats?.pendingVendors ?? 0}
              </Text>
              <Text className="text-muted-foreground mt-1 text-xs">Awaiting approval</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
