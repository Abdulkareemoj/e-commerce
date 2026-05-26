import { useState, useEffect } from 'react';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import {
  View, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TrendingUp, Users, Store, Package, ShoppingCart, DollarSign,
} from 'lucide-react-native';
import { api } from '@/lib/api';

export default function AnalyticsScreen() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.publicGet('/admin/dashboard/stats')
      .then((res) => setStats(res.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const metrics = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, change: '+12%' },
    { label: 'Active Vendors', value: stats.totalVendors, icon: Store, change: '+5%' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, change: '+8%' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, change: '+23%' },
    { label: 'Total Revenue', value: `$${parseFloat(stats.totalRevenue || '0').toLocaleString()}`, icon: DollarSign, change: '+18%' },
    { label: 'Pending Payouts', value: stats.pendingPayouts, icon: TrendingUp, change: '' },
  ] : [];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-4 gap-6">
        <Text variant="h2" className="font-bold">Analytics</Text>

        {loading ? (
          <ActivityIndicator className="mt-8" />
        ) : (
          <>
            <View className="flex-row flex-wrap gap-4">
              {metrics.map((m) => (
                <View key={m.label} className="min-w-[150px] flex-1 rounded-lg border bg-card p-4">
                  <View className="mb-2 flex-row items-center gap-2">
                    <Icon as={m.icon} size={20} className="text-primary" />
                    <Text className="text-sm font-medium">{m.label}</Text>
                  </View>
                  <Text variant="h3" className="font-bold">{m.value}</Text>
                  {m.change ? (
                    <Text className="text-xs text-green-500 mt-1">{m.change} vs last month</Text>
                  ) : null}
                </View>
              ))}
            </View>

            <View className="rounded-lg border bg-card p-4">
              <Text className="font-semibold mb-2">Pending Vendors</Text>
              <Text className="text-3xl font-bold text-amber-500">{stats.pendingVendors}</Text>
              <Text className="text-xs text-muted-foreground mt-1">Awaiting approval</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
