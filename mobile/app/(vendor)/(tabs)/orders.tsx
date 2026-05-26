import React, { useEffect, useState } from 'react';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/money';

const STATUS_FLOW = ['pending', 'accepted', 'shipped', 'delivered'] as const;

function getNextStatus(current: string): string | null {
  const idx = STATUS_FLOW.indexOf(current as any);
  if (idx >= 0 && idx < STATUS_FLOW.length - 1) return STATUS_FLOW[idx + 1];
  return null;
}

function OrderCard({ order, onUpdate }: { order: any; onUpdate: () => void }) {
  const [updating, setUpdating] = useState(false);

  const handleUpdateStatus = async (itemId: string, status: string) => {
    setUpdating(true);
    try {
      await api.put(`/vendor/orders/items/${itemId}/status`, { status });
      onUpdate();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="gap-3 p-4">
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-sm font-semibold text-muted-foreground">
            Order #{order.id.slice(0, 8)}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {order.user?.name} ({order.user?.email})
          </Text>
          <Text className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Badge variant="outline">
          <Text className="text-xs">{order.status}</Text>
        </Badge>
      </View>

      {order.items?.map((item: any) => (
        <View key={item.id} className="rounded-lg border border-border p-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 gap-1">
              <Text className="text-sm font-medium">{item.productName}</Text>
              <Text className="text-xs text-muted-foreground">
                {item.quantity}x @ ${parseFloat(item.price).toFixed(2)}
              </Text>
            </View>
            <Badge variant="outline">
              <Text className="text-xs capitalize">{item.status}</Text>
            </Badge>
          </View>

          {getNextStatus(item.status) && (
            <Button
              size="sm"
              className="mt-2"
              onPress={() => handleUpdateStatus(item.id, getNextStatus(item.status)!)}
              disabled={updating}>
              <Text className="text-xs">
                {updating ? '...' : `Mark as ${getNextStatus(item.status)}`}
              </Text>
            </Button>
          )}
        </View>
      ))}

      <Text className="text-sm font-bold">
        Total: {formatCurrency(Math.round(parseFloat(order.totalAmount || 0) * 100), 'USD')}
      </Text>
    </Card>
  );
}

export default function VendorOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/vendor/orders');
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading orders...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-4 gap-4">
        <Text variant="h2" className="font-bold">
          Manage Orders
        </Text>
        {orders.length === 0 ? (
          <Text className="mt-10 text-center text-muted-foreground">No orders yet.</Text>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} onUpdate={fetchOrders} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
