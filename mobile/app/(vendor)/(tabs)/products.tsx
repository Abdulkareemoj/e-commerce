import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { FormInput } from '@/components/ui/form-input';
import { FieldSet, Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { View, Pressable, FlatList, Alert, ScrollView, Image } from 'react-native';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/money';
import { ImageUpload } from '@/components/ImageUpload';
import { Plus, Pencil, Trash2, Package, Image as ImageIcon, Layers, X, Check, Ban } from 'lucide-react-native';

const variantSchema = z.object({
  name: z.string().min(1, 'Required'),
  sku: z.string().min(1, 'Required'),
  price: z.string().optional(),
  stock: z.string().optional(),
  attributes: z.string().optional(),
});

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.string().min(1, 'Price is required').regex(/^\d+(\.\d{1,2})?$/, 'Invalid price'),
  stock: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  images: z.array(z.object({ url: z.string() })),
  variants: z.array(variantSchema),
});

type ProductFormData = z.infer<typeof productSchema>;

interface VariantEntry {
  id?: string;
  name: string;
  sku: string;
  price: string;
  stock: string;
  attributes: string;
}

function ProductForm({
  product,
  categories,
  onSave,
  onClose,
}: {
  product?: any;
  categories: { id: string; name: string }[];
  onSave: () => void;
  onClose: () => void;
}) {
  const { control, handleSubmit, setValue, watch } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      price: product?.price?.toString() || '',
      stock: product?.stock?.toString() || '0',
      description: product?.description || '',
      categoryId: product?.categoryId || '',
      images: (product?.images || []).map((u: string) => ({ url: u })),
      variants: (product?.variants || []).map((v: any) => ({
        id: v.id,
        name: v.name || '',
        sku: v.sku || '',
        price: v.price?.toString() || '',
        stock: v.stock?.toString() || '0',
        attributes: v.attributes ? JSON.stringify(v.attributes) : '',
      })),
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control, name: 'images' });
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control, name: 'variants' });

  const [saving, setSaving] = React.useState(false);
  const [deletedVariantIds, setDeletedVariantIds] = React.useState<string[]>([]);

  const categoryId = watch('categoryId');

  const syncVariants = async (productId: string, formVariants: VariantEntry[]) => {
    const existingVariants = product?.variants || [];

    for (const vid of deletedVariantIds) {
      try { await api.delete(`/vendor/variants/${productId}/${vid}`); } catch {}
    }

    for (const v of formVariants) {
      const body = {
        name: v.name,
        sku: v.sku,
        price: v.price || null,
        stock: parseInt(v.stock || '0'),
        attributes: v.attributes ? (() => { try { return JSON.parse(v.attributes); } catch { return null; } })() : null,
      };

      if (v.id && existingVariants.find((ev: any) => ev.id === v.id)) {
        try { await api.put(`/vendor/variants/${productId}/${v.id}`, body); } catch {}
      } else {
        try { await api.post(`/vendor/variants/${productId}`, body); } catch {}
      }
    }
  };

  const onSubmit = React.useCallback(
    async (data: ProductFormData) => {
      setSaving(true);
      try {
        const body: any = {
          name: data.name,
          price: data.price,
          stock: parseInt(data.stock || '0'),
          description: data.description || '',
          categoryId: data.categoryId || null,
          images: data.images.map((i) => i.url).filter(Boolean),
        };

        if (product) {
          await api.put(`/vendor/products/${product.id}`, body);
          await syncVariants(product.id, data.variants);
        } else {
          body.variants = data.variants.map((v) => ({
            name: v.name,
            sku: v.sku,
            price: v.price || null,
            stock: parseInt(v.stock || '0'),
            attributes: v.attributes ? (() => { try { return JSON.parse(v.attributes); } catch { return null; } })() : null,
          }));
          await api.post('/vendor/products', body);
        }
        onSave();
        onClose();
      } catch (err) {
        console.error('Failed to save product:', err);
        Alert.alert('Error', 'Failed to save product. Please try again.');
      } finally {
        setSaving(false);
      }
    },
    [product, onSave, onClose, deletedVariantIds]
  );

  return (
    <FieldSet>
      <FormInput control={control} name="name" label="Name" placeholder="Product name" />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormInput
            control={control}
            name="price"
            label="Price"
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>
        <View className="flex-1">
          <FormInput
            control={control}
            name="stock"
            label="Stock"
            placeholder="0"
            keyboardType="number-pad"
          />
        </View>
      </View>

      <Field>
        <FieldContent>
          <FieldLabel>Category</FieldLabel>
          <Select
            value={categoryId}
            onValueChange={(v: any) => setValue('categoryId', v?.value || '')}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="" label="No category" />
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id} label={c.name} />
              ))}
            </SelectContent>
          </Select>
        </FieldContent>
      </Field>

      <FormInput
        control={control}
        name="description"
        label="Description"
        placeholder="Product description"
        multiline
      />

      <View className="gap-3">
        <Text className="text-sm font-medium">Images</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
          <View className="flex-row gap-2">
            {imageFields.map((field, index) => (
              <View key={field.id} className="relative">
                <Image
                  source={{ uri: field.url }}
                  className="h-24 w-24 rounded-xl"
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => removeImage(index)}
                  className="bg-destructive absolute -top-2 -right-2 rounded-full p-1">
                  <Icon as={X} size={12} className="text-destructive-foreground" />
                </Pressable>
              </View>
            ))}
            <View className="h-24 w-24 rounded-xl border-2 border-dashed border-border">
              <ImageUpload
                onUpload={(url) => appendImage({ url })}
                purpose="product"
                compact
                className="flex-1"
              />
            </View>
          </View>
        </ScrollView>
      </View>

      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium">Variants</Text>
          <Button
            variant="ghost"
            size="sm"
            onPress={() =>
              appendVariant({ name: '', sku: '', price: '', stock: '0', attributes: '' })
            }>
            <Icon as={Plus} size={14} className="text-primary" />
            <Text className="text-primary text-xs">Add</Text>
          </Button>
        </View>
        {variantFields.map((field, index) => {
          const isExisting = product && (field as any).id;

          return (
            <View key={field.id} className="bg-secondary/50 rounded-2xl p-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-semibold">Variant {index + 1}</Text>
                <Pressable
                  onPress={() => {
                    if (isExisting) setDeletedVariantIds((prev) => [...prev, (field as any).id!]);
                    removeVariant(index);
                  }}
                  className="bg-destructive/10 size-7 items-center justify-center rounded-lg">
                  <Icon as={Trash2} size={12} className="text-destructive" />
                </Pressable>
              </View>
              <View className="gap-2">
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <FormInput
                      control={control}
                      name={`variants.${index}.name` as any}
                      label="Name"
                      placeholder="e.g. Small"
                    />
                  </View>
                  <View className="flex-1">
                    <FormInput
                      control={control}
                      name={`variants.${index}.sku` as any}
                      label="SKU"
                      placeholder="e.g. PROD-S"
                    />
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <FormInput
                      control={control}
                      name={`variants.${index}.price` as any}
                      label="Price (optional)"
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View className="flex-1">
                    <FormInput
                      control={control}
                      name={`variants.${index}.stock` as any}
                      label="Stock"
                      placeholder="0"
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
                <FormInput
                  control={control}
                  name={`variants.${index}.attributes` as any}
                  label='Attributes (JSON)'
                  placeholder='{"Color": "Red", "Size": "M"}'
                />
              </View>
            </View>
          );
        })}
      </View>

      <View className="flex-row gap-2 pt-2">
        <DialogClose asChild>
          <Button variant="outline" className="flex-1">
            <Text>Cancel</Text>
          </Button>
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
  const [editProduct, setEditProduct] = React.useState<any>(null);
  const [showCreate, setShowCreate] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(false);
  const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([]);
  const [selectMode, setSelectMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

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

  const fetchCategories = React.useCallback(async () => {
    try {
      const res = await api.publicGet('/products/categories');
      setCategories(res.categories || []);
    } catch {}
  }, []);

  React.useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleDelete = React.useCallback(
    async (id: string, name: string) => {
      Alert.alert(
        'Delete Product',
        `Are you sure you want to delete "${name}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await api.delete(`/vendor/products/${id}`);
                fetchProducts();
              } catch (err) {
                console.error('Failed to delete product:', err);
              }
            },
          },
        ]
      );
    },
    [fetchProducts]
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkToggleActive = async (active: boolean) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    Alert.alert(
      active ? 'Activate Products' : 'Deactivate Products',
      `${active ? 'Activate' : 'Deactivate'} ${ids.length} product${ids.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: active ? 'Activate' : 'Deactivate',
          onPress: async () => {
            try {
              await Promise.all(
                ids.map((id) => api.put(`/vendor/products/${id}`, { isAvailable: active }))
              );
              setSelectedIds(new Set());
              setSelectMode(false);
              fetchProducts();
            } catch (err) {
              console.error('Bulk update failed:', err);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className="text-muted-foreground">Loading products...</Text>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <View className="bg-card border-border items-center justify-center border-b px-5 py-4">
        <Text className="text-foreground text-lg font-bold">Products</Text>
      </View>
      <View className="flex-1 p-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-foreground text-lg font-bold">
            {selectMode
              ? `${selectedIds.size} selected`
              : `${products.length} product${products.length !== 1 ? 's' : ''}`}
          </Text>
          <View className="flex-row gap-2">
            {selectMode ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onPress={() => bulkToggleActive(true)}>
                  <Icon as={Check} size={14} className="text-success" />
                  <Text className="text-xs">Activate</Text>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onPress={() => bulkToggleActive(false)}>
                  <Icon as={Ban} size={14} className="text-destructive" />
                  <Text className="text-xs">Deactivate</Text>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-xl"
                  onPress={() => {
                    setSelectMode(false);
                    setSelectedIds(new Set());
                  }}>
                  <Text className="text-xs">Cancel</Text>
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onPress={() => setSelectMode(true)}>
                  <Text className="text-xs">Select</Text>
                </Button>
                <Dialog open={showCreate} onOpenChange={setShowCreate}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="rounded-xl">
                      <Icon as={Plus} size={16} className="text-primary-foreground" />
                      <Text className="text-primary-foreground font-semibold">Add</Text>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90%]">
                    <DialogHeader>
                      <DialogTitle>New Product</DialogTitle>
                    </DialogHeader>
                    <ProductForm
                      categories={categories}
                      onSave={fetchProducts}
                      onClose={() => setShowCreate(false)}
                    />
                  </DialogContent>
                </Dialog>
              </>
            )}
          </View>
        </View>

        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogContent className="max-h-[90%]">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            {editProduct && (
              <ProductForm
                product={editProduct}
                categories={categories}
                onSave={() => {
                  setEditProduct(null);
                  fetchProducts();
                }}
                onClose={() => {
                  setEditProduct(null);
                  setShowEdit(false);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={fetchProducts}
          contentContainerClassName="gap-3"
          ListEmptyComponent={
            <View className="mt-10 items-center gap-3">
              <View className="bg-muted size-16 items-center justify-center rounded-full">
                <Icon as={Package} size={32} className="text-muted-foreground" />
              </View>
              <Text className="text-muted-foreground text-center">
                No products yet. Create your first one!
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Card className="bg-card border-border rounded-2xl border p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-row flex-1 gap-3">
                  {selectMode && (
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                  )}
                  <View className="flex-1 gap-1">
                    <Text className="text-foreground font-medium">{item.name}</Text>
                    <Text className="text-muted-foreground text-sm">
                      {formatCurrency(Math.round(parseFloat(item.price) * 100))} · {item.stock} in
                      stock
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {item.isAvailable ? (
                        <Badge variant="default" className="bg-success self-start">
                          <Text className="text-[10px]">Active</Text>
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="self-start">
                          <Text className="text-[10px]">Inactive</Text>
                        </Badge>
                      )}
                      {item.images?.length > 0 && (
                        <View className="flex-row items-center gap-1">
                          <Icon as={ImageIcon} size={10} className="text-muted-foreground" />
                          <Text className="text-muted-foreground text-[10px]">
                            {item.images.length}
                          </Text>
                        </View>
                      )}
                      {item.variants?.length > 0 && (
                        <View className="flex-row items-center gap-1">
                          <Icon as={Layers} size={10} className="text-muted-foreground" />
                          <Text className="text-muted-foreground text-[10px]">
                            {item.variants.length}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {!selectMode && (
                  <View className="flex-row items-center gap-2">
                    <Pressable
                      onPress={() => {
                        setEditProduct(item);
                        setShowEdit(true);
                      }}>
                      <Icon as={Pencil} size={16} className="text-muted-foreground" />
                    </Pressable>
                    <Pressable onPress={() => handleDelete(item.id, item.name)}>
                      <Icon as={Trash2} size={16} className="text-destructive" />
                    </Pressable>
                  </View>
                )}
              </View>
            </Card>
          )}
        />
      </View>
    </View>
  );
}
