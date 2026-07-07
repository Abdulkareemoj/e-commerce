import { useState, useEffect, useCallback } from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { View, ScrollView, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { Search, Package, EyeOff, Trash2, ChevronRight } from 'lucide-react-native';
import { api } from '@/lib/api';

export default function ProductsScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async (p = 1, s = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (s) params.set('search', s);
      const res = await api.publicGet(`/admin/products/list?${params}`);
      setProducts(res.products);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(page, search);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchProducts(1, search);
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await api.publicPut(`/admin/products/${id}/availability`, { isAvailable: !current });
    fetchProducts(page, search);
  };

  const deleteProduct = async (id: string) => {
    await api.publicDelete(`/admin/products/${id}`);
    fetchProducts(page, search);
  };

  return (
    <View className="bg-background flex-1">
      <View className="gap-4 p-4">
        <Text variant="h2" className="font-bold">
          Products
        </Text>
        <View className="flex-row items-center gap-2">
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search products..."
            className="flex-1"
            onSubmitEditing={handleSearch}
          />
          <Button size="icon" variant="outline" onPress={handleSearch}>
            <Icon as={Search} size={18} />
          </Button>
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {loading ? (
          <ActivityIndicator className="mt-8" />
        ) : products.length === 0 ? (
          <Text className="text-muted-foreground mt-8 text-center">No products found</Text>
        ) : (
          <View className="gap-3 pb-4">
            {products.map((p: any) => (
              <View key={p.id} className="bg-card rounded-lg border p-4">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold">{p.name}</Text>
                    <Text className="text-muted-foreground mt-0.5 text-xs">
                      {p.storeName} • ${parseFloat(p.price).toFixed(2)}
                    </Text>
                    <View className="mt-1 flex-row items-center gap-2">
                      <Text className="text-muted-foreground text-xs">Stock: {p.stock}</Text>
                      {p.categoryName && (
                        <Badge variant="outline" className="h-5">
                          <Text className="text-[10px]">{p.categoryName}</Text>
                        </Badge>
                      )}
                    </View>
                  </View>
                  <Badge className={p.isAvailable ? 'bg-green-500/20' : 'bg-red-500/20'}>
                    <Text
                      className={`text-xs ${p.isAvailable ? 'text-green-500' : 'text-red-500'}`}>
                      {p.isAvailable ? 'Active' : 'Hidden'}
                    </Text>
                  </Badge>
                </View>
                <View className="mt-3 flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1"
                    onPress={() => toggleAvailability(p.id, p.isAvailable)}>
                    <Icon as={EyeOff} size={14} />
                    <Text className="text-xs">{p.isAvailable ? 'Hide' : 'Show'}</Text>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 gap-1"
                    onPress={() => deleteProduct(p.id)}>
                    <Icon as={Trash2} size={14} />
                    <Text className="text-xs">Delete</Text>
                  </Button>
                </View>
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
