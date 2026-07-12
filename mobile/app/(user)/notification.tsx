import * as React from 'react';
import { View, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/AuthGuard';
import { api } from '@/lib/api';
import { Bell, Check, ShoppingBag, MessageSquare, Package, DollarSign, AlertTriangle, Info } from 'lucide-react-native';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const TYPE_ICONS: Record<string, any> = {
  order_placed: ShoppingBag,
  order_accepted: Package,
  order_shipped: Package,
  order_delivered: Check,
  order_cancelled: AlertTriangle,
  new_message: MessageSquare,
  payout: DollarSign,
  system: Info,
};

const TYPE_COLORS: Record<string, string> = {
  order_placed: 'text-primary',
  order_accepted: 'text-primary',
  order_shipped: 'text-amber-500',
  order_delivered: 'text-success',
  order_cancelled: 'text-destructive',
  new_message: 'text-primary',
  payout: 'text-success',
  system: 'text-muted-foreground',
};

function NotificationIcon({ type }: { type: string }) {
  const icon = TYPE_ICONS[type] || Info;
  const color = TYPE_COLORS[type] || 'text-muted-foreground';
  return <Icon as={icon} size={18} className={color} />;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);

  const fetchNotifications = React.useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      const res = await api.get(`/user/notifications?page=${pageNum}&limit=20`);
      const items = res.notifications || [];
      if (pageNum === 1) {
        setNotifications(items);
      } else {
        setNotifications((prev) => [...prev, ...items]);
      }
      setUnreadCount(res.unread || 0);
      setHasMore(items.length === 20);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchNotifications(1, true);
  }, [fetchNotifications]);

  const loadMore = React.useCallback(() => {
    if (!hasMore || loading) return;
    fetchNotifications(page + 1);
  }, [hasMore, loading, page, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/user/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/user/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <AuthGuard icon={Bell} message="Sign in to view your notifications." requiredRole="user">
      <View className="bg-background flex-1">
        <View className="border-border flex-row items-center justify-between border-b p-4">
          <Text variant="h2" className="font-bold">Notifications</Text>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onPress={markAllRead}>
              <Text className="text-xs">Mark all read</Text>
            </Button>
          )}
        </View>

        <ScrollView
          contentContainerClassName="p-4 gap-2"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onMomentumScrollEnd={(e) => {
            const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
            if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 100) {
              loadMore();
            }
          }}>
          {loading && notifications.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Text className="text-muted-foreground">Loading...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View className="items-center justify-center gap-3 py-20">
              <Icon as={Bell} size={40} className="text-muted-foreground" />
              <Text className="text-muted-foreground text-center">No notifications yet.</Text>
            </View>
          ) : (
            <>
              {notifications.map((n) => (
                <Pressable
                  key={n.id}
                  onPress={() => !n.read && markAsRead(n.id)}
                  className={`flex-row items-start gap-3 rounded-2xl p-4 ${
                    n.read ? 'bg-card' : 'bg-primary/5'
                  }`}>
                  <View className={`size-10 items-center justify-center rounded-xl ${
                    n.read ? 'bg-secondary' : 'bg-primary/10'
                  }`}>
                    <NotificationIcon type={n.type} />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <View className="flex-row items-start justify-between">
                      <Text className={`text-sm flex-1 ${n.read ? 'text-foreground' : 'text-foreground font-semibold'}`}>
                        {n.title}
                      </Text>
                      {!n.read && <View className="bg-primary mt-1.5 ml-2 size-2 shrink-0 rounded-full" />}
                    </View>
                    {n.body && (
                      <Text className="text-muted-foreground text-sm leading-relaxed" numberOfLines={2}>
                        {n.body}
                      </Text>
                    )}
                    <Text className="text-muted-foreground mt-1 text-xs">
                      {n.createdAt ? formatDate(n.createdAt) : ''}
                    </Text>
                  </View>
                </Pressable>
              ))}
              {hasMore && (
                <View className="items-center py-4">
                  <Button variant="outline" size="sm" onPress={loadMore}>
                    <Text>Load more</Text>
                  </Button>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </AuthGuard>
  );
}
