import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Store, Check, X } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';

type VendorStatus = 'pending' | 'approved' | 'rejected';

interface Vendor {
  id: string;
  userId: string;
  storeName: string;
  storeSlug: string;
  description: string | null;
  isVerified: VendorStatus;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
}

const STATUS_TABS: { label: string; value: VendorStatus | 'all' }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All', value: 'all' },
];

function StatusBadge({ status }: { status: VendorStatus }) {
  const STATUS_STYLES: Record<VendorStatus, { bg: string; text: string }> = {
    approved: { bg: 'bg-success/10', text: 'text-success' },
    rejected: { bg: 'bg-destructive/10', text: 'text-destructive' },
    pending: { bg: 'bg-warning/10', text: 'text-warning' },
  };
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <View className={`${style.bg} rounded-full px-2 py-0.5`}>
      <Text className={`${style.text} text-[10px] font-semibold capitalize`}>{status}</Text>
    </View>
  );
}

export default function VendorsScreen() {
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [filter, setFilter] = React.useState<VendorStatus | 'all'>('pending');
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  async function fetchVendors() {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await api.get(`/admin/vendor/list${params}`);
      setVendors(res.vendors || []);
    } catch (err) {
      console.error('Failed to fetch vendors', err);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchVendors();
  }, [filter]);

  async function handleApprove(id: string) {
    try {
      await api.put(`/admin/vendor/${id}/approve`, {});
      fetchVendors();
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to approve vendor', variant: 'destructive' });
    }
  }

  async function handleReject(id: string) {
    try {
      await api.put(`/admin/vendor/${id}/reject`, {});
      fetchVendors();
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to reject vendor', variant: 'destructive' });
    }
  }

  return (
    <View className="bg-background flex-1">
      <View className="bg-card border-border flex-row gap-2 border-b px-4 py-2">
        {STATUS_TABS.map((tab) => (
          <Pressable
            key={tab.value}
            onPress={() => setFilter(tab.value)}
            className={`rounded-full px-4 py-1.5 ${filter === tab.value ? 'bg-primary' : 'bg-muted'}`}>
            <Text
              className={`text-sm font-medium ${filter === tab.value ? 'text-primary-foreground' : 'text-foreground'}`}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerClassName="p-4 gap-3">
        {loading ? (
          <Text className="text-muted-foreground mt-10 text-center">Loading vendors...</Text>
        ) : vendors.length === 0 ? (
          <Text className="text-muted-foreground mt-10 text-center">No vendors found</Text>
        ) : (
          vendors.map((v) => (
            <Card key={v.id} className="bg-card border-border gap-3 rounded-2xl border p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 flex-row items-center gap-3">
                  <View className="bg-primary/10 size-10 items-center justify-center rounded-xl">
                    <Icon as={Store} size={20} className="text-primary" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold">{v.storeName}</Text>
                    <Text className="text-muted-foreground text-xs">/{v.storeSlug}</Text>
                    {v.userName && (
                      <Text className="text-muted-foreground mt-0.5 text-xs">
                        {v.userName} — {v.userEmail}
                      </Text>
                    )}
                  </View>
                </View>
                <StatusBadge status={v.isVerified} />
              </View>

              {v.description && (
                <Text className="text-muted-foreground text-sm">{v.description}</Text>
              )}

              {v.isVerified === 'pending' && (
                <View className="flex-row gap-2 pt-1">
                  <Button
                    size="sm"
                    className="flex-1 rounded-xl"
                    onPress={() => handleApprove(v.id)}>
                    <Icon as={Check} size={14} className="text-primary-foreground" />
                    <Text className="text-primary-foreground font-semibold">Approve</Text>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl"
                    onPress={() => handleReject(v.id)}>
                    <Icon as={X} size={14} className="text-destructive" />
                    <Text className="text-destructive font-semibold">Reject</Text>
                  </Button>
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}
