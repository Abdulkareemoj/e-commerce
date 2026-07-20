import { useState, useEffect, useCallback } from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { View, ScrollView, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';

const STATUS_OPTIONS = [
  '',
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (p = 1, s = statusFilter) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p), limit: '20' });
        if (s) params.set('status', s);
        const res = await api.publicGet(`/admin/orders/list?${params}`);
        setOrders(res.orders);
        setTotal(res.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    fetchOrders(page, statusFilter);
  }, [page]);

  const { toast } = useToast();

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.publicPut(`/admin/orders/${id}/status`, { status });
      fetchOrders(page, statusFilter);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update order status', variant: 'destructive' });
    }
  };

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      confirmed: 'bg-blue-500/20 text-blue-500',
      processing: 'bg-indigo-500/20 text-indigo-500',
      shipped: 'bg-purple-500/20 text-purple-500',
      delivered: 'bg-green-500/20 text-green-500',
      cancelled: 'bg-red-500/20 text-red-500',
      refunded: 'bg-orange-500/20 text-orange-500',
    };
    return (
      <Badge className={colors[s]?.split(' ')[0] || 'bg-zinc-500/20'}>
        <Text className={`text-xs ${colors[s]?.split(' ')[1] || 'text-zinc-500'}`}>{s}</Text>
      </Badge>
    );
  };

  return (
    <View className="bg-background flex-1">
      <View className="gap-4 p-4">
        <Text variant="h2" className="font-bold">
          Orders
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {STATUS_OPTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`rounded-full border px-3 py-1.5 ${statusFilter === s ? 'bg-primary border-primary' : 'border-border'}`}>
                <Text
                  className={`text-sm ${statusFilter === s ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {s || 'All'}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-4">
        {loading ? (
          <ActivityIndicator className="mt-8" />
        ) : orders.length === 0 ? (
          <Text className="text-muted-foreground mt-8 text-center">No orders found</Text>
        ) : (
          <View className="gap-3 pb-4">
            {orders.map((o: any) => (
              <View key={o.id} className="bg-card rounded-lg border">
                <Pressable
                  className="p-4"
                  onPress={() => setExpanded(expanded === o.id ? null : o.id)}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-semibold">#{o.id.slice(0, 8)}</Text>
                      <Text className="text-muted-foreground mt-0.5 text-xs">
                        {o.userName} • ${parseFloat(String(o.totalAmount || '0')).toFixed(2)} •{' '}
                        {o.itemCount} items
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      {statusBadge(o.status)}
                      <Icon
                        as={expanded === o.id ? ChevronUp : ChevronDown}
                        size={16}
                        className="text-muted-foreground"
                      />
                    </View>
                  </View>
                </Pressable>

                {expanded === o.id && (
                  <View className="border-border gap-3 border-t px-4 pt-3 pb-4">
                    <View className="flex-row flex-wrap gap-2">
                      {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={o.status === s ? 'default' : 'outline'}
                          className="h-7"
                          onPress={() => updateStatus(o.id, s)}>
                          <Text className="text-xs">{s}</Text>
                        </Button>
                      ))}
                    </View>
                    <Text className="text-muted-foreground text-xs">
                      Created: {new Date(o.createdAt).toLocaleDateString()}
                      {o.trackingNumber ? ` • Tracking: ${o.trackingNumber}` : ''}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View className="border-border flex-row items-center justify-between border-t p-4">
        <Text className="text-muted-foreground text-sm">{total} total</Text>
        <View className="flex-row gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onPress={() => setPage((p) => p - 1)}>
            <Text>Previous</Text>
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page * 20 >= total}
            onPress={() => setPage((p) => p + 1)}>
            <Text>Next</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
