import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Link, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Image } from 'react-native';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/money';
import { Icon } from '@/components/ui/icon';
import { Package } from 'lucide-react-native';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-warning/10', text: 'text-warning' },
  accepted: { bg: 'bg-primary/10', text: 'text-primary' },
  shipped: { bg: 'bg-info/10', text: 'text-info' },
  delivered: { bg: 'bg-success/10', text: 'text-success' },
  cancelled: { bg: 'bg-destructive/10', text: 'text-destructive' },
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const { isAuthenticated, user, isLoading, initializeAuth } = useAuthStore();
  const [order, setOrder] = React.useState<any>(null);
  const [fetching, setFetching] = React.useState(true);

  React.useEffect(() => {
    initializeAuth();
  }, []);

  React.useEffect(() => {
    const fetchOrder = async () => {
      if (isAuthenticated && user?.role === 'user') {
        try {
          const res = await api.get(`/user/orders/${id}`);
          setOrder(res.order);
        } catch (error) {
          console.error('Target order missing', error);
        } finally {
          setFetching(false);
        }
      } else if (!isLoading) {
        setFetching(false);
      }
    };
    fetchOrder();
  }, [isAuthenticated, user, isLoading, id]);

  if (isLoading || fetching) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'user') {
    return (
      <View className="bg-background flex-1 items-center justify-center gap-4 p-6">
        <View className="bg-muted size-16 items-center justify-center rounded-full">
          <Icon as={Package} size={32} className="text-muted-foreground" />
        </View>
        <Text className="text-muted-foreground text-center">
          You must be signed in to view order details
        </Text>
        <Link href="/(auth)/sign-in" asChild>
          <Button variant="default" className="rounded-xl">
            <Text className="text-primary-foreground font-semibold">Sign In</Text>
          </Button>
        </Link>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="bg-background flex-1 items-center justify-center gap-3">
        <View className="bg-muted size-16 items-center justify-center rounded-full">
          <Icon as={Package} size={32} className="text-muted-foreground" />
        </View>
        <Text className="text-muted-foreground">Order not found</Text>
      </View>
    );
  }

  const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.pending;

  return (
    <View className="bg-background flex-1">
      <View className="bg-card border-border items-center justify-center border-b px-5 py-4">
        <Text className="text-foreground text-lg font-bold">Order Detail</Text>
      </View>
      <View className="flex-1 gap-4 p-4">
        <View>
          <Text className="text-muted-foreground text-xs">ID: {order.id}</Text>
        </View>

        <Card className="bg-card border-border gap-3 rounded-2xl border p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground font-semibold">Status</Text>
            <View className={`${statusStyle.bg} rounded-full px-3 py-1`}>
              <Text className={`${statusStyle.text} text-xs font-semibold capitalize`}>
                {order.status}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-muted-foreground">Total</Text>
            <Text className="text-foreground font-bold">
              {formatCurrency(Math.round(parseFloat(order.totalAmount || 0) * 100), 'USD')}
            </Text>
          </View>
          {order.trackingNumber && (
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground">Tracking</Text>
              <Text className="text-foreground text-sm font-medium">{order.trackingNumber}</Text>
            </View>
          )}
          <View className="flex-row items-center justify-between">
            <Text className="text-muted-foreground">Placed</Text>
            <Text className="text-foreground text-sm">
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {order.couponCode && (
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground">Coupon</Text>
              <View className="bg-primary/10 rounded-full px-2 py-0.5">
                <Text className="text-primary text-xs font-medium">{order.couponCode}</Text>
              </View>
            </View>
          )}
        </Card>

        <Text className="text-foreground font-semibold">Items</Text>
        {order.items?.map((item: any) => {
          const itemStatus = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
          return (
            <Card
              key={item.id}
              className="bg-card border-border flex-row gap-3 overflow-hidden rounded-2xl border p-0">
              <Image
                source={{ uri: item.product?.images?.[0] }}
                className="bg-muted size-20"
                resizeMode="cover"
              />
              <View className="flex-1 justify-center gap-1 py-3 pr-3">
                <Text className="text-foreground text-sm font-medium">
                  {item.product?.name || 'Product'}
                </Text>
                <Text className="text-muted-foreground text-xs">
                  {item.quantity}x @{' '}
                  {formatCurrency(Math.round(parseFloat(item.price || 0) * 100), 'USD')}
                </Text>
                <View className={`${itemStatus.bg} mt-1 self-start rounded-full px-2 py-0.5`}>
                  <Text className={`${itemStatus.text} text-[10px] font-semibold capitalize`}>
                    {item.status || 'pending'}
                  </Text>
                </View>
              </View>
            </Card>
          );
        })}
      </View>
    </View>
  );
}
