import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Package, ChevronRight, Clock, Truck, CheckCircle } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { formatCurrency } from '@/lib/money';
import { Link } from 'expo-router';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';

function getStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' };
    case 'shipped':
      return { icon: Truck, color: 'text-info', bg: 'bg-info/10' };
    case 'processing':
      return { icon: Clock, color: 'text-warning', bg: 'bg-warning/10' };
    default:
      return { icon: Package, color: 'text-muted-foreground', bg: 'bg-muted' };
  }
}

function OrderCard({ order }: { order: any }) {
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Link href={`/(user)/orders/${order.id}`} asChild>
      <Pressable className="bg-card shadow-card active:bg-secondary/50 rounded-2xl p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 gap-1">
            <Text className="text-foreground text-sm font-semibold">
              Order #{order.id.slice(0, 8)}...
            </Text>
            <Text className="text-muted-foreground text-xs">
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View
            className={`flex-row items-center gap-1.5 rounded-full px-2.5 py-1 ${statusConfig.bg}`}>
            <Icon as={StatusIcon} size={12} className={statusConfig.color} />
            <Text className={`text-xs font-medium ${statusConfig.color}`}>{order.status}</Text>
          </View>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-primary text-lg font-bold">
            {formatCurrency(Math.round(parseFloat(order.totalAmount || 0) * 100), 'USD')}
          </Text>
          <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
        </View>

        {order.trackingNumber && (
          <Text className="text-muted-foreground mt-1 text-xs">
            Tracking: {order.trackingNumber}
          </Text>
        )}
      </Pressable>
    </Link>
  );
}

export default function OrdersScreen() {
  const { isAuthenticated, user, isLoading, initializeAuth } = useAuthStore();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [fetching, setFetching] = React.useState(true);

  React.useEffect(() => {
    initializeAuth();
  }, []);

  React.useEffect(() => {
    const fetchOrders = async () => {
      if (isAuthenticated && user?.role === 'user') {
        try {
          const res = await api.get('/user/orders');
          setOrders(res.orders || []);
        } catch (error) {
          console.error('Failed to load orders', error);
        } finally {
          setFetching(false);
        }
      } else if (!isLoading) {
        setFetching(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, user, isLoading]);

  if (isLoading || fetching) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className="text-muted-foreground">Loading orders...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'user') {
    return (
      <View className="bg-background flex-1 items-center justify-center gap-4 p-6">
        <View className="bg-muted size-16 items-center justify-center rounded-full">
          <Icon as={Package} size={32} className="text-muted-foreground" />
        </View>
        <Text className="text-muted-foreground text-center text-sm">
          Sign in to view your orders
        </Text>
        <Link href="/(auth)/sign-in" asChild>
          <Button className="h-12 rounded-2xl">
            <Text className="text-primary-foreground font-semibold">Sign In</Text>
          </Button>
        </Link>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <View className="bg-card border-border items-center justify-center border-b px-5 py-4">
        <Text className="text-foreground text-lg font-bold">My Orders</Text>
      </View>
      <ScrollView contentContainerClassName="p-5 pb-8" showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View className="items-center justify-center gap-3 py-16">
            <View className="bg-muted size-16 items-center justify-center rounded-full">
              <Icon as={Package} size={32} className="text-muted-foreground" />
            </View>
            <Text className="text-foreground text-base font-semibold">No orders yet</Text>
            <Text className="text-muted-foreground text-sm">
              Your order history will appear here
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
