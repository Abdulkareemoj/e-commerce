import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import * as React from 'react';
import { View, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';
import { Flag, Check, X, Clock, ChevronDown, ChevronUp } from 'lucide-react-native';

const STATUS_ICONS: Record<string, any> = {
  pending: Clock,
  resolved: Check,
  dismissed: X,
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-500',
  resolved: 'text-success',
  dismissed: 'text-muted-foreground',
};

export default function AdminReportsScreen() {
  const [reports, setReports] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const { confirm } = useConfirmDialog();
  const { toast } = useToast();

  const fetchReports = React.useCallback(async () => {
    try {
      const qs = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/admin/reports${qs}`);
      setReports(res.reports || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleResolve = async (id: string) => {
    try {
      await api.put(`/admin/reports/${id}`, { status: 'resolved' });
      fetchReports();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to resolve report', variant: 'destructive' });
    }
  };

  const handleDismiss = async (id: string) => {
    confirm({
      title: 'Dismiss Report',
      description: 'Are you sure?',
      destructive: true,
      confirmText: 'Dismiss',
      onConfirm: async () => {
        try {
          await api.put(`/admin/reports/${id}`, { status: 'dismissed' });
          fetchReports();
        } catch (err) {
          toast({ title: 'Error', description: 'Failed to dismiss report', variant: 'destructive' });
        }
      },
    });
  };

  const filters = ['', 'pending', 'resolved', 'dismissed'];

  return (
    <View className="bg-background flex-1">
      <View className="border-border border-b p-4">
        <Text variant="h2" className="font-bold">Reports</Text>
      </View>

      <View className="border-border flex-row gap-2 border-b px-4 py-2">
        {filters.map((f) => (
          <Pressable
            key={f}
            onPress={() => { setStatusFilter(f); setLoading(true); }}
            className={`rounded-full px-4 py-1.5 ${statusFilter === f ? 'bg-primary' : 'bg-secondary'}`}>
            <Text className={statusFilter === f ? 'text-primary-foreground text-xs font-medium' : 'text-foreground text-xs'}>
              {f ? f.charAt(0).toUpperCase() + f.slice(1) : 'All'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerClassName="p-4 gap-3">
        {loading ? (
          <Text className="text-muted-foreground text-center pt-10">Loading reports...</Text>
        ) : reports.length === 0 ? (
          <View className="items-center gap-3 pt-10">
            <Icon as={Flag} size={32} className="text-muted-foreground" />
            <Text className="text-muted-foreground text-center">No reports found</Text>
          </View>
        ) : (
          reports.map((rep) => {
            const isExpanded = expandedId === rep.id;
            return (
              <Card key={rep.id} className="rounded-2xl p-4">
                <Pressable onPress={() => setExpandedId(isExpanded ? null : rep.id)}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 gap-1">
                      <View className="flex-row items-center gap-2">
                        <Icon as={STATUS_ICONS[rep.status] || Clock} size={14} className={STATUS_COLORS[rep.status]} />
                        <Text className="text-foreground text-sm font-medium capitalize">{rep.reason}</Text>
                      </View>
                      <Text className="text-muted-foreground text-xs">
                        {rep.targetType} · {new Date(rep.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Icon as={isExpanded ? ChevronUp : ChevronDown} size={16} className="text-muted-foreground" />
                  </View>
                </Pressable>

                {isExpanded && (
                  <View className="mt-3 gap-3 border-t pt-3">
                    <View className="gap-1">
                      <Text className="text-muted-foreground text-xs">Reporter</Text>
                      <Text className="text-foreground text-sm">{rep.user?.name || 'Unknown'} ({rep.user?.email || ''})</Text>
                    </View>
                    <View className="gap-1">
                      <Text className="text-muted-foreground text-xs">Target</Text>
                      <Text className="text-foreground text-sm">{rep.targetType} · {rep.targetId}</Text>
                    </View>
                    {rep.description && (
                      <View className="gap-1">
                        <Text className="text-muted-foreground text-xs">Description</Text>
                        <Text className="text-foreground text-sm">{rep.description}</Text>
                      </View>
                    )}
                    <View className="gap-1">
                      <Text className="text-muted-foreground text-xs">Status</Text>
                      <Badge variant={rep.status === 'resolved' ? 'default' : rep.status === 'dismissed' ? 'secondary' : 'outline'} className="self-start">
                        <Text className="text-xs capitalize">{rep.status}</Text>
                      </Badge>
                    </View>

                    {rep.status === 'pending' && (
                      <View className="flex-row gap-2 pt-1">
                        <Button variant="outline" size="sm" className="flex-1" onPress={() => handleDismiss(rep.id)}>
                          <Icon as={X} size={14} className="text-destructive" />
                          <Text className="text-destructive text-xs">Dismiss</Text>
                        </Button>
                        <Button size="sm" className="flex-1" onPress={() => handleResolve(rep.id)}>
                          <Icon as={Check} size={14} className="text-primary-foreground" />
                          <Text className="text-primary-foreground text-xs">Resolve</Text>
                        </Button>
                      </View>
                    )}
                  </View>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
