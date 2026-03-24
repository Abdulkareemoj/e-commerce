import { Text } from '@/components/ui/text';
import { Link, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/money';

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
          console.error("Target order missing", error);
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'user') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text className="text-center mb-4">You must be signed in to view order details.</Text>
        <Button variant="default">
          <Link href="/(auth)/sign-in">Sign In</Link>
        </Button>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text className="text-muted-foreground">Order not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-4">
        <Text variant="h2" className="mb-2 font-bold">
          Order Detail
        </Text>
        <Text className="text-muted-foreground mb-4">ID: {order.id}</Text>

        <View className="bg-card p-4 rounded-lg border border-border mb-4">
             <Text className="font-semibold text-lg mb-2">Summary</Text>
             <Text>Status: {order.status}</Text>
             <Text>Total: {formatCurrency(Math.round(parseFloat(order.totalAmount || 0) * 100), 'USD')}</Text>
             <Text>Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
        </View>

        <Text variant="h4" className="font-semibold mb-2">Items</Text>
        {order.items?.map((item: any) => (
           <View key={item.id} className="flex-row justify-between mb-2 pb-2 border-b border-border">
             <Text>Product ID: {item.productId?.slice(0, 8)}</Text>
             <Text className="font-medium">{item.quantity}x @ {formatCurrency(Math.round(parseFloat(item.price || 0) * 100), 'USD')}</Text>
           </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
