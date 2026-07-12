import React, { useEffect, useState } from 'react';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { View, ScrollView } from 'react-native';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/money';
import { Icon } from '@/components/ui/icon';
import { ShoppingCart } from 'lucide-react-native';

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

  const handleAcceptOrder = async () => {
    setUpdating(true);
    try {
      // Update all items in the order to accepted
      if (order.items) {
        await Promise.all(
          order.items.map((item: any) =>
            api.put(`/vendor/orders/items/${item.id}/status`, { status: 'accepted' })
          )
        );
      }
      onUpdate();
    } catch (err) {
      console.error('Failed to accept order:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    setUpdating(true);
    try {
      // Update all items in the order to cancelled
      if (order.items) {
        await Promise.all(
          order.items.map((item: any) =>
            api.put(`/vendor/orders/items/${item.id}/status`, { status: 'cancelled' })
          )
        );
      }
      onUpdate();
    } catch (err) {
      console.error('Failed to cancel order:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleShipOrder = async () => {
    setUpdating(true);
    try {
      // Update all items in the order to shipped
      if (order.items) {
        await Promise.all(
          order.items.map((item: any) =>
            api.put(`/vendor/orders/items/${item.id}/status`, { status: 'shipped' })
          )
        );
      }
      onUpdate();
    } catch (err) {
      console.error('Failed to ship order:', err);
    } finally {
      setUpdating(false);
    }
  };

  const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-warning/10', text: 'text-warning' },
    accepted: { bg: 'bg-primary/10', text: 'text-primary' },
    shipped: { bg: 'bg-info/10', text: 'text-info' },
    delivered: { bg: 'bg-success/10', text: 'text-success' },
    cancelled: { bg: 'bg-destructive/10', text: 'text-destructive' },
  };

  return (
    <Card className="bg-card border-border gap-3 rounded-2xl border p-4">
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-foreground text-sm font-semibold">
            Order #{order.id.slice(0, 8)}
          </Text>
          <Text className="text-muted-foreground text-xs">
            {order.user?.name} ({order.user?.email})
          </Text>
          <Text className="text-muted-foreground text-xs">
            {new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View
          className={`${STATUS_STYLES[order.status]?.bg || 'bg-muted'} rounded-full px-2 py-0.5`}>
          <Text
            className={`${STATUS_STYLES[order.status]?.text || 'text-muted-foreground'} text-[10px] font-semibold`}>
            {order.status}
          </Text>
        </View>
      </View>

      {order.items?.map((item: any) => {
        const itemStatus = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
        return (
          <View key={item.id} className="bg-secondary/50 rounded-xl p-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 gap-1">
                <Text className="text-foreground text-sm font-medium">{item.productName}</Text>
                <Text className="text-muted-foreground text-xs">
                  {item.quantity}x @ ${parseFloat(item.price).toFixed(2)}
                </Text>
              </View>
              <View className={`${itemStatus.bg} rounded-full px-2 py-0.5`}>
                <Text className={`${itemStatus.text} text-[10px] font-semibold capitalize`}>
                  {item.status}
                </Text>
              </View>
            </View>

            {getNextStatus(item.status) && (
              <Button
                size="sm"
                className="mt-2 rounded-xl"
                onPress={() => handleUpdateStatus(item.id, getNextStatus(item.status)!)}
                disabled={updating}>
                <Text className="text-primary-foreground text-xs font-semibold">
                  {updating ? '...' : `Mark as ${getNextStatus(item.status)}`}
                </Text>
              </Button>
            )}
          </View>
        );
      })}

      <View className="flex-row items-center justify-between">
        <Text className="text-foreground text-sm font-bold">
          Total: {formatCurrency(Math.round(parseFloat(order.totalAmount || 0) * 100), 'USD')}
        </Text>
      </View>

      {order.status === 'pending' && (
        <View className="flex-row gap-2">
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 rounded-xl"
            onPress={handleCancelOrder}
            disabled={updating}>
            <Text className="text-xs font-semibold">Cancel</Text>
          </Button>
          <Button
            size="sm"
            className="flex-1 rounded-xl"
            onPress={handleAcceptOrder}
            disabled={updating}>
            <Text className="text-primary-foreground text-xs font-semibold">Accept</Text>
          </Button>
        </View>
      )}

      {order.status === 'accepted' && (
        <Button
          size="sm"
          className="w-full rounded-xl"
          onPress={handleShipOrder}
          disabled={updating}>
          <Text className="text-primary-foreground text-xs font-semibold">
            {updating ? '...' : 'Mark as Shipped'}
          </Text>
        </Button>
      )}
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
      <View className="bg-background flex-1 items-center justify-center">
        <Text className="text-muted-foreground">Loading orders...</Text>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <ScrollView contentContainerClassName="p-4 gap-4">
        {orders.length === 0 ? (
          <View className="mt-10 items-center gap-3">
            <View className="bg-muted size-16 items-center justify-center rounded-full">
              <Icon as={ShoppingCart} size={32} className="text-muted-foreground" />
            </View>
            <Text className="text-muted-foreground text-center">No orders yet</Text>
          </View>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} onUpdate={fetchOrders} />)
        )}
      </ScrollView>
    </View>
  );
}
