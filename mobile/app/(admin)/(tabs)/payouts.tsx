import { useState, useEffect, useCallback } from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import {
  View, ScrollView, ActivityIndicator, RefreshControl, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, Check, X } from 'lucide-react-native';
import { api } from '@/lib/api';

export default function PayoutsScreen() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchPayouts = useCallback(async (p = 1, s = statusFilter) => {
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
  }, [statusFilter]);

  useEffect(() => { fetchPayouts(page, statusFilter); }, [page]);

  const processPayout = async (id: string, status: string) => {
    await api.publicPut(`/admin/payouts/${id}/process`, { status });
    fetchPayouts(page, statusFilter);
  };

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      approved: 'bg-green-500/20 text-green-500',
      rejected: 'bg-red-500/20 text-red-500',
    };
    return <Badge className={colors[s]?.split(' ')[0] || 'bg-zinc-500/20'}>
      <Text className={`text-xs ${colors[s]?.split(' ')[1] || 'text-zinc-500'}`}>{s}</Text>
    </Badge>;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-4 gap-4">
        <Text variant="h2" className="font-bold">Payouts</Text>
        <View className="flex-row gap-2">
          {['', 'pending', 'approved', 'rejected'].map((s) => (
            <Pressable
              key={s}
              onPress={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full border ${statusFilter === s ? 'bg-primary border-primary' : 'border-border'}`}>
              <Text className={`text-sm ${statusFilter === s ? 'text-primary-foreground' : 'text-foreground'}`}>
                {s || 'All'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {loading ? (
          <ActivityIndicator className="mt-8" />
        ) : payouts.length === 0 ? (
          <Text className="text-center text-muted-foreground mt-8">No payouts found</Text>
        ) : (
          <View className="gap-3 pb-4">
            {payouts.map((p: any) => (
              <View key={p.id} className="rounded-lg border bg-card p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold">${parseFloat(p.amount).toFixed(2)}</Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {p.storeName || 'Unknown store'}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {new Date(p.requestedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {statusBadge(p.status)}
                </View>

                {p.status === 'pending' && (
                  <View className="mt-3 flex-row gap-2">
                    <Button size="sm" className="h-8 gap-1 flex-1" onPress={() => processPayout(p.id, 'approved')}>
                      <Icon as={Check} size={14} />
                      <Text className="text-xs">Approve</Text>
                    </Button>
                    <Button size="sm" variant="destructive" className="h-8 gap-1 flex-1"
                      onPress={() => processPayout(p.id, 'rejected')}>
                      <Icon as={X} size={14} />
                      <Text className="text-xs">Reject</Text>
                    </Button>
                  </View>
                )}

                {p.note && (
                  <Text className="mt-2 text-xs text-muted-foreground italic">Note: {p.note}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View className="flex-row items-center justify-between p-4 border-t border-border">
        <Text className="text-sm text-muted-foreground">{total} total</Text>
        <View className="flex-row gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onPress={() => setPage((p) => p - 1)}>
            <Text>Previous</Text>
          </Button>
          <Button size="sm" variant="outline" disabled={page * 20 >= total} onPress={() => setPage((p) => p + 1)}>
            <Text>Next</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
