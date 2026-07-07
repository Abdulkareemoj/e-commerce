import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  Wallet,
  ArrowUpRight,
  Clock,
} from 'lucide-react-native';
import { api } from '@/lib/api';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api
      .get('/admin/dashboard/stats')
      .then((res) => setStats(res.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: 'Users',
      icon: Users,
      value: stats?.totalUsers ?? '—',
      sub: 'Total registered',
      route: '/(admin)/users',
      color: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Vendors',
      icon: Store,
      value: stats?.totalVendors ?? '—',
      sub: `${stats?.pendingVendors ?? 0} pending`,
      route: '/(admin)/(tabs)/vendors',
      color: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
    {
      label: 'Products',
      icon: Package,
      value: stats?.totalProducts ?? '—',
      sub: 'Listed products',
      route: '/(admin)/products',
      color: 'bg-green-50',
      iconColor: 'text-green-500',
    },
    {
      label: 'Orders',
      icon: ShoppingCart,
      value: stats?.totalOrders ?? '—',
      sub: 'Total orders',
      route: '/(admin)/orders',
      color: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      label: 'Revenue',
      icon: DollarSign,
      value: stats ? `$${parseFloat(stats.totalRevenue || '0').toLocaleString()}` : '—',
      sub: 'Total revenue',
      route: null,
      color: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Payouts',
      icon: Wallet,
      value: stats?.pendingPayouts ?? '—',
      sub: 'Pending payouts',
      route: '/(admin)/(tabs)/payouts',
      color: 'bg-rose-50',
      iconColor: 'text-rose-500',
    },
  ];

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="small" className="text-primary" />
        <Text className="text-muted-foreground mt-2 text-sm">Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <ScrollView contentContainerClassName="p-4 gap-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text variant="h2" className="text-foreground font-bold">
              Dashboard
            </Text>
            <Text className="text-muted-foreground text-sm">Platform overview</Text>
          </View>
          {stats?.pendingVendors > 0 && (
            <View className="flex-row items-center gap-1 rounded-full bg-amber-100 px-3 py-1">
              <Icon as={Clock} size={12} className="text-amber-600" />
              <Text className="text-xs font-semibold text-amber-700">
                {stats.pendingVendors} pending
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row flex-wrap gap-3">
          {statCards.map((card) => (
            <Pressable
              key={card.label}
              onPress={() => card.route && router.push(card.route as any)}
              className="bg-card shadow-card min-w-[140px] flex-1 rounded-2xl p-4"
              disabled={!card.route}>
              <View className={`mb-3 size-10 items-center justify-center rounded-xl ${card.color}`}>
                <Icon as={card.icon} size={20} className={card.iconColor} />
              </View>
              <Text className="text-foreground text-2xl font-bold">{card.value}</Text>
              <View className="mt-1 flex-row items-center justify-between">
                <Text className="text-muted-foreground text-xs">{card.label}</Text>
                {card.route && (
                  <Icon as={ArrowUpRight} size={12} className="text-muted-foreground" />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        <View className="bg-card shadow-card rounded-2xl p-4">
          <Text className="text-foreground mb-3 font-semibold">Quick Actions</Text>
          <View className="gap-2">
            <Pressable
              onPress={() => router.push('/(admin)/(tabs)/vendors')}
              className="bg-secondary/50 flex-row items-center justify-between rounded-xl p-3">
              <View className="flex-row items-center gap-3">
                <Icon as={Store} size={18} className="text-primary" />
                <Text className="text-foreground text-sm font-medium">Review Vendors</Text>
              </View>
              <Icon as={ArrowUpRight} size={14} className="text-muted-foreground" />
            </Pressable>
            <Pressable
              onPress={() => router.push('/(admin)/products')}
              className="bg-secondary/50 flex-row items-center justify-between rounded-xl p-3">
              <View className="flex-row items-center gap-3">
                <Icon as={Package} size={18} className="text-primary" />
                <Text className="text-foreground text-sm font-medium">Manage Products</Text>
              </View>
              <Icon as={ArrowUpRight} size={14} className="text-muted-foreground" />
            </Pressable>
            <Pressable
              onPress={() => router.push('/(admin)/(tabs)/payouts')}
              className="bg-secondary/50 flex-row items-center justify-between rounded-xl p-3">
              <View className="flex-row items-center gap-3">
                <Icon as={Wallet} size={18} className="text-primary" />
                <Text className="text-foreground text-sm font-medium">Process Payouts</Text>
              </View>
              <Icon as={ArrowUpRight} size={14} className="text-muted-foreground" />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
