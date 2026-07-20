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
function RevenueChart({ data }: { data: { date: string; label: string; revenue: number }[] }) {
  if (!data || data.length === 0) return null;

  const maxAmount = Math.max(...data.map((d) => d.revenue), 0);
  const chartHeight = 150;

  return (
    <View className="bg-card shadow-card rounded-2xl p-4">
      <Text className="text-foreground mb-3 font-semibold">Revenue Trend</Text>
      <View style={{ height: chartHeight }} className="flex-row items-end justify-between gap-2">
        {data.slice(-7).map((item, index) => {
          const barHeight = maxAmount > 0 ? (item.revenue / maxAmount) * (chartHeight - 30) : 0;
          return (
            <View key={index} className="flex-1 items-center gap-1">
              <Text className="text-muted-foreground text-xs">${item.revenue.toFixed(0)}</Text>
              <View className="bg-primary/80 w-full rounded-t-md" style={{ height: Math.max(barHeight, 4) }} />
              <Text className="text-muted-foreground text-xs">{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function formatTimeAgo(dateStr: string) {
  const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function ActivityFeed({ activities }: { activities: any[] }) {
  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'delivered': return CheckCircle;
      case 'cancelled':
      case 'refunded': return Clock;
      default: return ShoppingBag; // pending, confirmed, processing, shipped
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-500';
      case 'cancelled':
      case 'refunded': return 'text-red-500';
      default: return 'text-amber-500';
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <View className="bg-card shadow-card rounded-2xl p-4 items-center">
        <Text className="text-muted-foreground text-sm">No recent activity yet</Text>
      </View>
    );
  }

  return (
    <View className="bg-card shadow-card rounded-2xl p-4">
      <Text className="text-foreground mb-3 font-semibold">Recent Activity</Text>
      <View className="gap-3">
        {activities.slice(0, 5).map((activity, index) => {
          const ActivityIcon = getActivityIcon(activity.status);
          const iconColor = getActivityColor(activity.status);
          return (
            <View key={index} className="bg-secondary/30 flex-row items-center gap-3 rounded-xl p-3">
              <View className="bg-secondary size-10 items-center justify-center rounded-full">
                <Icon as={ActivityIcon} size={18} className={iconColor} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground text-sm">{activity.message}</Text>
                <Text className="text-muted-foreground text-xs">{formatTimeAgo(activity.createdAt)}</Text>
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

const revenueChartData = stats?.revenueChart || [];
const activityData = stats?.recentActivity || [];

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

{revenueChartData.length > 0 ? (
  <RevenueChart data={revenueChartData} />
) : (
  <View className="bg-card shadow-card rounded-2xl p-6 items-center">
    <Text className="text-muted-foreground text-sm">No revenue data yet</Text>
  </View>
)}

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
