import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/money';

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-500',
  accepted: 'text-blue-500',
  shipped: 'text-indigo-500',
  delivered: 'text-green-500',
  cancelled: 'text-destructive',
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
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'user') {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="mb-4 text-center">You must be signed in to view order details.</Text>
        <Link href="/(auth)/sign-in" asChild>
          <Button variant="default">
            <Text>Sign In</Text>
          </Button>
        </Link>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted-foreground">Order not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      <View className="flex-1 gap-4 p-4">
        <View>
          <Text variant="h2" className="font-bold">
            Order Detail
          </Text>
          <Text className="text-muted-foreground mt-1 text-xs">ID: {order.id}</Text>
        </View>

        <Card className="gap-3 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold">Status</Text>
            <Text className={`text-sm font-medium capitalize ${STATUS_COLORS[order.status] || ''}`}>
              {order.status}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-muted-foreground">Total</Text>
            <Text className="font-bold">
              {formatCurrency(Math.round(parseFloat(order.totalAmount || 0) * 100), 'USD')}
            </Text>
          </View>
          {order.trackingNumber && (
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground">Tracking</Text>
              <Text className="text-sm font-medium">{order.trackingNumber}</Text>
            </View>
          )}
          <View className="flex-row items-center justify-between">
            <Text className="text-muted-foreground">Placed</Text>
            <Text className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</Text>
          </View>
          {order.couponCode && (
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground">Coupon</Text>
              <Badge variant="outline">
                <Text className="text-xs">{order.couponCode}</Text>
              </Badge>
            </View>
          )}
        </Card>

        <Text className="font-semibold">Items</Text>
        {order.items?.map((item: any) => (
          <Card key={item.id} className="flex-row gap-3 overflow-hidden p-0">
            <Image
              source={{ uri: item.product?.images?.[0] }}
              className="bg-muted size-20"
              resizeMode="cover"
            />
            <View className="flex-1 justify-center gap-1 py-3 pr-3">
              <Text className="text-sm font-medium">{item.product?.name || 'Product'}</Text>
              <Text className="text-muted-foreground text-xs">
                {item.quantity}x @{' '}
                {formatCurrency(Math.round(parseFloat(item.price || 0) * 100), 'USD')}
              </Text>
              <Text
                className={`text-xs font-medium capitalize ${STATUS_COLORS[item.status] || ''}`}>
                {item.status || 'pending'}
              </Text>
            </View>
          </Card>
        ))}
      </View>
    </SafeAreaView>
  );
}
