import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Store, Package, ShoppingCart, DollarSign, Wallet, TrendingUp } from 'lucide-react-native';
import { api } from '@/lib/api';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.publicGet('/admin/dashboard/stats')
      .then((res) => setStats(res.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Users', icon: Users, value: stats?.totalUsers ?? '—', sub: 'Total registered', route: '/(admin)/(tabs)/users' },
    { label: 'Vendors', icon: Store, value: stats?.totalVendors ?? '—', sub: `${stats?.pendingVendors ?? 0} pending approval`, route: '/(admin)/(tabs)/vendors' },
    { label: 'Products', icon: Package, value: stats?.totalProducts ?? '—', sub: 'Listed products', route: '/(admin)/(tabs)/products' },
    { label: 'Orders', icon: ShoppingCart, value: stats?.totalOrders ?? '—', sub: 'Total orders', route: '/(admin)/(tabs)/orders' },
    { label: 'Revenue', icon: DollarSign, value: stats ? `$${parseFloat(stats.totalRevenue || '0').toLocaleString()}` : '—', sub: 'Total revenue', route: null },
    { label: 'Payouts', icon: Wallet, value: stats?.pendingPayouts ?? '—', sub: 'Pending payouts', route: '/(admin)/(tabs)/payouts' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-4 gap-6">
        <View className="flex-row items-center justify-between">
          <Text variant="h2" className="font-bold">Dashboard</Text>
          {loading && <ActivityIndicator size="small" />}
        </View>

        <View className="flex-row flex-wrap gap-4">
          {cards.map((card) => (
            <View
              key={card.label}
              className="min-w-[150px] flex-1 rounded-lg border bg-card p-4"
              {...(card.route ? { onClick: () => router.push(card.route!) } : {})}>
              <View className="mb-2 flex-row items-center gap-2">
                <Icon as={card.icon} size={20} className="text-primary" />
                <Text className="text-sm font-medium">{card.label}</Text>
              </View>
              <Text variant="h3" className="font-bold">{card.value}</Text>
              <Text className="text-xs text-muted-foreground">{card.sub}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
