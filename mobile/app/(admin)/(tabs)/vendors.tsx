import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Store, Check, X, ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const variant = status === 'approved' ? 'default' as const : status === 'rejected' ? 'destructive' as const : 'outline' as const;
  return <Badge variant={variant}><Text className="text-xs font-medium capitalize">{status}</Text></Badge>;
}

export default function VendorsScreen() {
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [filter, setFilter] = React.useState<VendorStatus | 'all'>('pending');
  const [loading, setLoading] = React.useState(true);

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

  React.useEffect(() => { fetchVendors(); }, [filter]);

  async function handleApprove(id: string) {
    try {
      await api.put(`/admin/vendor/${id}/approve`, {});
      fetchVendors();
    } catch (err: any) {
      console.error('Failed to approve', err);
    }
  }

  async function handleReject(id: string) {
    try {
      await api.put(`/admin/vendor/${id}/reject`, {});
      fetchVendors();
    } catch (err: any) {
      console.error('Failed to reject', err);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="border-b border-border p-4">
        <Text variant="h2" className="font-bold">Manage Vendors</Text>
      </View>

      <View className="flex-row gap-2 border-b border-border px-4 py-2">
        {STATUS_TABS.map((tab) => (
          <Pressable
            key={tab.value}
            onPress={() => setFilter(tab.value)}
            className={`rounded-full px-4 py-1.5 ${filter === tab.value ? 'bg-primary' : 'bg-muted'}`}
          >
            <Text className={`text-sm font-medium ${filter === tab.value ? 'text-primary-foreground' : 'text-foreground'}`}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerClassName="p-4 gap-3">
        {loading ? (
          <Text className="text-center text-muted-foreground mt-10">Loading vendors...</Text>
        ) : vendors.length === 0 ? (
          <Text className="text-center text-muted-foreground mt-10">No vendors found.</Text>
        ) : (
          vendors.map((v) => (
            <Card key={v.id} className="p-4 gap-3">
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="size-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon as={Store} size={20} className="text-primary" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold">{v.storeName}</Text>
                    <Text className="text-xs text-muted-foreground">/{v.storeSlug}</Text>
                    {v.userName && (
                      <Text className="text-xs text-muted-foreground mt-0.5">
                        {v.userName} — {v.userEmail}
                      </Text>
                    )}
                  </View>
                </View>
                <StatusBadge status={v.isVerified} />
              </View>

              {v.description && (
                <Text className="text-sm text-muted-foreground">{v.description}</Text>
              )}

              {v.isVerified === 'pending' && (
                <View className="flex-row gap-2 pt-1">
                  <Button size="sm" className="flex-1" onPress={() => handleApprove(v.id)}>
                    <Icon as={Check} size={14} />
                    <Text>Approve</Text>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onPress={() => handleReject(v.id)}>
                    <Icon as={X} size={14} />
                    <Text>Reject</Text>
                  </Button>
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
