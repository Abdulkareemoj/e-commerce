import { useState, useEffect, useCallback } from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  View, ScrollView, ActivityIndicator, Pressable, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search, Shield, Ban, UserCog, ChevronRight,
} from 'lucide-react-native';
import { api } from '@/lib/api';

export default function UsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async (p = 1, s = search, r = roleFilter) => {
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (s) params.set('search', s);
      if (r) params.set('role', r);
      const res = await api.publicGet(`/admin/users/list?${params}`);
      setUsers(res.users);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUsers(page, search, roleFilter); }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers(1, search, roleFilter);
  };

  const handleBan = async (userId: string, banned: boolean) => {
    await api.publicPut(`/admin/users/${userId}/ban`, { banned, reason: banned ? 'Banned by admin' : undefined });
    fetchUsers(page, search, roleFilter);
  };

  const handleRole = async (userId: string, role: string) => {
    await api.publicPut(`/admin/users/${userId}/role`, { role });
    fetchUsers(page, search, roleFilter);
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = { admin: 'bg-red-500', vendor: 'bg-blue-500', user: 'bg-zinc-500' };
    return <Badge className={colors[role] || 'bg-zinc-500'}><Text className="text-white text-xs">{role}</Text></Badge>;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-4 gap-4">
        <Text variant="h2" className="font-bold">Users</Text>

        <View className="flex-row items-center gap-2">
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or email..."
            className="flex-1"
            onSubmitEditing={handleSearch}
          />
          <Button size="icon" variant="outline" onPress={handleSearch}>
            <Icon as={Search} size={18} />
          </Button>
        </View>

        <View className="flex-row gap-2">
          {['', 'user', 'vendor', 'admin'].map((r) => (
            <Pressable
              key={r}
              onPress={() => { setRoleFilter(r); setPage(1); fetchUsers(1, search, r); }}
              className={`px-3 py-1.5 rounded-full border ${roleFilter === r ? 'bg-primary border-primary' : 'border-border'}`}>
              <Text className={`text-sm ${roleFilter === r ? 'text-primary-foreground' : 'text-foreground'}`}>
                {r || 'All'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(page, search, roleFilter); }} />}>
        {loading ? (
          <ActivityIndicator className="mt-8" />
        ) : users.length === 0 ? (
          <Text className="text-center text-muted-foreground mt-8">No users found</Text>
        ) : (
          <View className="gap-3 pb-4">
            {users.map((u: any) => (
              <View key={u.id} className="rounded-lg border bg-card p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 flex-row items-center gap-3">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Text className="font-bold">{u.name?.charAt(0) || '?'}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold">{u.name}</Text>
                      <Text className="text-xs text-muted-foreground">{u.email}</Text>
                    </View>
                  </View>
                  {roleBadge(u.role)}
                </View>

                <View className="mt-3 flex-row items-center gap-2">
                  {u.banned && (
                    <Badge className="bg-red-500/20">
                      <Text className="text-red-500 text-xs">Banned</Text>
                    </Badge>
                  )}
                  {!u.emailVerified && (
                    <Badge variant="outline">
                      <Text className="text-xs text-muted-foreground">Unverified</Text>
                    </Badge>
                  )}
                </View>

                <View className="mt-3 flex-row gap-2">
                  <Button size="sm" variant="outline" className="h-8 gap-1"
                    onPress={() => handleRole(u.id, u.role === 'admin' ? 'user' : 'admin')}>
                    <Icon as={UserCog} size={14} />
                    <Text className="text-xs">Toggle Admin</Text>
                  </Button>
                  <Button size="sm" variant={u.banned ? 'outline' : 'destructive'} className="h-8 gap-1"
                    onPress={() => handleBan(u.id, !u.banned)}>
                    <Icon as={Ban} size={14} />
                    <Text className="text-xs">{u.banned ? 'Unban' : 'Ban'}</Text>
                  </Button>
                </View>
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
