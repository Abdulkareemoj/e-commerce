import React, { useEffect, useState, useCallback } from 'react';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { View, ScrollView, RefreshControl, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/money';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

function ProductForm({ product, onSave, onClose }: { product?: any; onSave: () => void; onClose: () => void }) {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [stock, setStock] = useState(product?.stock?.toString() || '0');
  const [description, setDescription] = useState(product?.description || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !price) return;
    setSaving(true);
    try {
      const body = { name, price, stock: parseInt(stock) || 0, description };
      if (product) {
        await api.put(`/vendor/products/${product.id}`, body);
      } else {
        await api.post('/vendor/products', body);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="gap-4">
      <View>
        <Text className="mb-1 text-sm font-medium">Name</Text>
        <Input value={name} onChangeText={setName} placeholder="Product name" />
      </View>
      <View>
        <Text className="mb-1 text-sm font-medium">Price</Text>
        <Input value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="decimal-pad" />
      </View>
      <View>
        <Text className="mb-1 text-sm font-medium">Stock</Text>
        <Input value={stock} onChangeText={setStock} placeholder="0" keyboardType="number-pad" />
      </View>
      <View>
        <Text className="mb-1 text-sm font-medium">Description</Text>
        <Input value={description} onChangeText={setDescription} placeholder="Product description" multiline />
      </View>
      <View className="flex-row gap-2">
        <DialogClose asChild>
          <Button variant="outline" className="flex-1">
            <Text>Cancel</Text>
          </Button>
        </DialogClose>
        <Button className="flex-1" onPress={handleSave} disabled={saving || !name || !price}>
          <Text>{saving ? 'Saving...' : product ? 'Update' : 'Create'}</Text>
        </Button>
      </View>
    </View>
  );
}

export default function ProductsScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/vendor/products');
      setProducts(res.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/vendor/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading products...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text variant="h2" className="font-bold">Products</Text>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Icon as={Plus} size={16} />
                <Text className="ml-1">Add</Text>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[500px]">
              <DialogHeader>
                <DialogTitle>New Product</DialogTitle>
              </DialogHeader>
              <ProductForm onSave={fetchProducts} onClose={() => setShowCreate(false)} />
            </DialogContent>
          </Dialog>
        </View>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchProducts(); }}
          contentContainerClassName="gap-3"
          ListEmptyComponent={
            <Text className="mt-10 text-center text-muted-foreground">No products yet. Create your first one!</Text>
          }
          renderItem={({ item }) => (
            <Card className="p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 gap-1">
                  <Text className="font-medium">{item.name}</Text>
                  <Text className="text-sm text-muted-foreground">
                    {formatCurrency(Math.round(parseFloat(item.price) * 100))} · {item.stock} in stock
                  </Text>
                  {item.variants && item.variants.length > 0 && (
                    <Text className="text-xs text-muted-foreground">
                      {item.variants.length} variant{item.variants.length > 1 ? 's' : ''}
                    </Text>
                  )}
                </View>
                <View className="flex-row items-center gap-2">
                  <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                    <Text className="text-xs">{item.isAvailable ? 'Active' : 'Inactive'}</Text>
                  </Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Pressable onPress={() => setEditingProduct(item)}>
                        <Icon as={Pencil} size={16} className="text-muted-foreground" />
                      </Pressable>
                    </DialogTrigger>
                    <DialogContent className="max-h-[500px]">
                      <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                      </DialogHeader>
                      <ProductForm product={item} onSave={fetchProducts} onClose={() => setEditingProduct(null)} />
                    </DialogContent>
                  </Dialog>
                  <Pressable onPress={() => handleDelete(item.id)}>
                    <Icon as={Trash2} size={16} className="text-destructive" />
                  </Pressable>
                </View>
              </View>
            </Card>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
