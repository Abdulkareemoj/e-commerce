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
  UserPlus,
  ShoppingBag,
  CheckCircle,
} from 'lucide-react-native';
import { api } from '@/lib/api';
import { useRouter } from 'expo-router';

// Chart component - simple bar chart
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

// Activity feed component
function ActivityFeed({ activities }: { activities: any[] }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return UserPlus;
      case 'vendor_approved':
        return Store;
      case 'order_placed':
        return ShoppingBag;
      case 'order_completed':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registered':
        return 'text-blue-500';
      case 'vendor_approved':
        return 'text-green-500';
      case 'order_placed':
        return 'text-amber-500';
      case 'order_completed':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  if (!activities || activities.length === 0) return null;

  return (
    <View className="bg-card shadow-card rounded-2xl p-4">
      <Text className="text-foreground mb-3 font-semibold">Recent Activity</Text>
      <View className="gap-3">
        {activities.slice(0, 5).map((activity, index) => {
          const ActivityIcon = getActivityIcon(activity.type);
          const iconColor = getActivityColor(activity.type);
          return (
            <View
              key={index}
              className="bg-secondary/30 flex-row items-center gap-3 rounded-xl p-3">
              <View className="bg-secondary size-10 items-center justify-center rounded-full">
                <Icon as={ActivityIcon} size={18} className={iconColor} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground text-sm">{activity.message}</Text>
                <Text className="text-muted-foreground text-xs">{activity.timeAgo}</Text>
              </View>
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
  const router = useRouter();

  useEffect(() => {
    api
      .get('/admin/dashboard/stats')
      .then((res) => setStats(res.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Generate mock data if not provided by API
  const revenueChartData = stats?.revenueChart || [
    { date: '2024-01-01', amount: 450000 },
    { date: '2024-01-02', amount: 520000 },
    { date: '2024-01-03', amount: 380000 },
    { date: '2024-01-04', amount: 610000 },
    { date: '2024-01-05', amount: 490000 },
    { date: '2024-01-06', amount: 720000 },
    { date: '2024-01-07', amount: 580000 },
  ];

  const activityData = stats?.recentActivity || [
    { type: 'user_registered', message: 'New user registered', timeAgo: '2 min ago' },
    { type: 'order_placed', message: 'New order #1234 placed', timeAgo: '15 min ago' },
    { type: 'vendor_approved', message: 'Vendor "Tech Store" approved', timeAgo: '1 hr ago' },
    { type: 'order_completed', message: 'Order #1230 delivered', timeAgo: '3 hr ago' },
    { type: 'user_registered', message: 'New user registered', timeAgo: '5 hr ago' },
  ];

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

        <RevenueChart data={revenueChartData} />

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

        <ActivityFeed activities={activityData} />
      </ScrollView>
    </View>
  );
}
