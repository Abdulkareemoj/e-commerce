import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Package, ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '@/lib/money';
import { Link } from 'expo-router';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';



function OrderCard({ order }: { order: any }) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'default';
      case 'Shipped':
        return 'secondary';
      case 'Processing':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Link href={`/(user)/orders/${order.id}`} asChild>
      <Pressable>
        <Card className="flex-col gap-3 p-4 active:bg-muted/50">
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-sm font-semibold text-muted-foreground">
                Order ID: {order.id.slice(0, 8)}...
              </Text>
              <Text className="text-xs text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleDateString()}</Text>
            </View>
            <Badge variant={getStatusVariant(order.status)}>
              <Text className="text-xs font-medium">{order.status}</Text>
            </Badge>
          </View>

          <View className="flex-row items-center justify-between">
            <View>
              <Text variant="h3" className="font-bold text-primary">
                {formatCurrency(Math.round(parseFloat(order.totalAmount || 0) * 100), 'USD')}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {order.trackingNumber ? `Tracking: ${order.trackingNumber}` : ''}
              </Text>
            </View>
            <Icon as={ChevronRight} size={24} className="text-muted-foreground" />
          </View>
        </Card>
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
          console.error("Failed to load orders", error);
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
      <View className="flex-1 items-center justify-center">
        <Text>Loading Orders...</Text>
      </View>
    );
  }

  // Require authentication and user role
  if (!isAuthenticated || !user || user.role !== 'user') {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="mb-4 text-center">You must be signed in as a user to view orders.</Text>
           <Link href="/(auth)/sign-in" asChild><Button variant="default"><Text>Sign In</Text></Button></Link>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="border-b border-border p-4">
        <Text variant="h2" className="font-bold">
          My Orders
        </Text>
      </View>
      <ScrollView contentContainerClassName="p-4 gap-4">
        {orders.length === 0 ? (
          <Text className="text-center text-muted-foreground mt-10">You have no orders yet.</Text>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
