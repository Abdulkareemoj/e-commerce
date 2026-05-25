import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { FormInput } from '@/components/ui/form-input';
import { FieldSet } from '@/components/ui/field';
import { View, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/money';
import { Plus, Pencil, Trash2 } from 'lucide-react-native';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.string().min(1, 'Price is required').regex(/^\d+(\.\d{1,2})?$/, 'Invalid price'),
  stock: z.string().optional(),
  description: z.string().optional(),
});

type ProductData = z.infer<typeof productSchema>;

function ProductForm({ product, onSave, onClose }: { product?: any; onSave: () => void; onClose: () => void }) {
  const { control, handleSubmit } = useForm<ProductData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      price: product?.price?.toString() || '',
      stock: product?.stock?.toString() || '0',
      description: product?.description || '',
    },
  });

  const [saving, setSaving] = React.useState(false);

  const onSubmit = React.useCallback(async (data: ProductData) => {
    setSaving(true);
    try {
      const body = { ...data, stock: parseInt(data.stock || '0') };
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
  }, [product, onSave, onClose]);

  return (
    <FieldSet>
      <FormInput control={control} name="name" label="Name" placeholder="Product name" />
      <FormInput control={control} name="price" label="Price" placeholder="0.00" keyboardType="decimal-pad" />
      <FormInput control={control} name="stock" label="Stock" placeholder="0" keyboardType="number-pad" />
      <FormInput control={control} name="description" label="Description" placeholder="Product description" multiline />
      <View className="flex-row gap-2 pt-2">
        <DialogClose asChild>
          <Button variant="outline" className="flex-1"><Text>Cancel</Text></Button>
        </DialogClose>
        <Button className="flex-1" onPress={handleSubmit(onSubmit)} disabled={saving}>
          <Text>{saving ? 'Saving...' : product ? 'Update' : 'Create'}</Text>
        </Button>
      </View>
    </FieldSet>
  );
}

export default function ProductsScreen() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingProduct, setEditingProduct] = React.useState<any>(null);
  const [showCreate, setShowCreate] = React.useState(false);

  const fetchProducts = React.useCallback(async () => {
    try {
      const res = await api.get('/vendor/products');
      setProducts(res.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = React.useCallback(async (id: string) => {
    try {
      await api.delete(`/vendor/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  }, [fetchProducts]);

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
              <DialogHeader><DialogTitle>New Product</DialogTitle></DialogHeader>
              <ProductForm onSave={fetchProducts} onClose={() => setShowCreate(false)} />
            </DialogContent>
          </Dialog>
        </View>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={fetchProducts}
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
                  {item.variants?.length > 0 && (
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
                      <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
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
