import { useState, useEffect, useCallback } from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Wallet, Check, X } from 'lucide-react-native';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';

export default function PayoutsScreen() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchPayouts = useCallback(
    async (p = 1, s = statusFilter) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p), limit: '20' });
        if (s) params.set('status', s);
        const res = await api.publicGet(`/admin/payouts/list?${params}`);
        setPayouts(res.payouts);
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
    fetchPayouts(page, statusFilter);
  }, [page]);

  const { toast } = useToast();

  const processPayout = async (id: string, status: string) => {
    try {
      await api.publicPut(`/admin/payouts/${id}/process`, { status });
      fetchPayouts(page, statusFilter);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to process payout', variant: 'destructive' });
    }
  };

  const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-warning/10', text: 'text-warning' },
    approved: { bg: 'bg-success/10', text: 'text-success' },
    rejected: { bg: 'bg-destructive/10', text: 'text-destructive' },
  };

  return (
    <View className="bg-background flex-1">
      <View className="bg-card border-border gap-4 border-b p-4">
        <View className="flex-row gap-2">
          {['', 'pending', 'approved', 'rejected'].map((s) => (
            <Pressable
              key={s}
              onPress={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 ${statusFilter === s ? 'bg-primary' : 'bg-muted'}`}>
              <Text
                className={`text-sm font-medium ${statusFilter === s ? 'text-primary-foreground' : 'text-foreground'}`}>
                {s || 'All'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {loading ? (
          <ActivityIndicator className="mt-8" color="hsl(var(--primary))" />
        ) : payouts.length === 0 ? (
          <Text className="text-muted-foreground mt-8 text-center">No payouts found</Text>
        ) : (
          <View className="gap-3 pb-4">
            {payouts.map((p: any) => {
              const style = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
              return (
                <View key={p.id} className="bg-card border-border rounded-2xl border p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-foreground font-semibold">
                        ${parseFloat(p.amount).toFixed(2)}
                      </Text>
                      <Text className="text-muted-foreground mt-0.5 text-xs">
                        {p.storeName || 'Unknown store'}
                      </Text>
                      <Text className="text-muted-foreground text-xs">
                        {new Date(p.requestedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className={`${style.bg} rounded-full px-2 py-0.5`}>
                      <Text className={`${style.text} text-[10px] font-semibold`}>{p.status}</Text>
                    </View>
                  </View>

                  {p.status === 'pending' && (
                    <View className="mt-3 flex-row gap-2">
                      <Button
                        size="sm"
                        className="h-8 flex-1 gap-1 rounded-xl"
                        onPress={() => processPayout(p.id, 'approved')}>
                        <Icon as={Check} size={14} className="text-primary-foreground" />
                        <Text className="text-primary-foreground text-xs font-semibold">
                          Approve
                        </Text>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 flex-1 gap-1 rounded-xl"
                        onPress={() => processPayout(p.id, 'rejected')}>
                        <Icon as={X} size={14} />
                        <Text className="text-xs font-semibold">Reject</Text>
                      </Button>
                    </View>
                  )}

                  {p.note && (
                    <Text className="text-muted-foreground mt-2 text-xs italic">
                      Note: {p.note}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View className="bg-card border-border flex-row items-center justify-between border-t p-4">
        <Text className="text-muted-foreground text-sm">{total} total</Text>
        <View className="flex-row gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl"
            disabled={page <= 1}
            onPress={() => setPage((p) => p - 1)}>
            <Text>Previous</Text>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl"
            disabled={page * 20 >= total}
            onPress={() => setPage((p) => p + 1)}>
            <Text>Next</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
