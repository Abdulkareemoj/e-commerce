import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ProductCard } from '@/components/ProductCard';
import { ListFilter } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { useLocalSearchParams, router } from 'expo-router';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

function buildQueryString(params: Record<string, string | undefined>): string {
  const parts: string[] = [];
  for (const [key, val] of Object.entries(params)) {
    if (val) parts.push(`${key}=${encodeURIComponent(val)}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

export default function CatalogScreen() {
  const { width } = useWindowDimensions();
  const isWeb = width >= 1024;

  const params = useLocalSearchParams<{
    categoryId?: string;
    categoryName?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
  }>();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([]);
  const [sortBy, setSortBy] = React.useState(params.sortBy || 'createdAt');
  const [sortOrder, setSortOrder] = React.useState(params.sortOrder || 'desc');
  const [webMinPrice, setWebMinPrice] = React.useState(params.minPrice || '');
  const [webMaxPrice, setWebMaxPrice] = React.useState(params.maxPrice || '');
  const [webCategoryId, setWebCategoryId] = React.useState(params.categoryId || '');

  React.useEffect(() => {
    api.publicGet('/products/categories').then((res) => {
      setCategories(res.categories || []);
    }).catch(() => {});
  }, []);

  React.useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const qs = buildQueryString({
          categoryId: params.categoryId || webCategoryId || undefined,
          search: params.search,
          minPrice: params.minPrice || webMinPrice || undefined,
          maxPrice: params.maxPrice || webMaxPrice || undefined,
          sortBy,
          sortOrder,
        });
        const res = await api.publicGet(`/products${qs}`);
        const mappedProducts = (res.products || []).map((p: any) => ({
          ...p,
          title: p.name,
          priceCents: Math.round(parseFloat(p.price || 0) * 100),
          currency: 'USD',
          rating: 4.5,
          attributes: {},
        }));
        setProducts(mappedProducts);
      } catch (err) {
        console.error('Failed to load catalog', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [params.categoryId, params.search, params.minPrice, params.maxPrice, params.sortBy, params.sortOrder, sortBy, sortOrder, webCategoryId, webMinPrice, webMaxPrice]);

  const applyWebFilters = () => {
    router.setParams({ categoryId: webCategoryId, minPrice: webMinPrice, maxPrice: webMaxPrice });
  };

  const activeFilterCount = [params.categoryId, params.minPrice, params.maxPrice].filter(Boolean).length;

  return (
    <View className="bg-background flex-1">
      <View className="flex-1 flex-row">
        {isWeb && (
          <View className="border-border w-64 flex-col gap-4 border-r p-4">
            <Text variant="h3" className="font-bold">Filters</Text>
            <ScrollView showsVerticalScrollIndicator={false} className="gap-4">
              <View className="gap-2">
                <Text className="text-sm font-medium">Category</Text>
                <Select
                  value={webCategoryId}
                  onValueChange={(v: any) => setWebCategoryId(v?.value || '')}>
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="" label="All Categories" />
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id} label={c.name} />
                    ))}
                  </SelectContent>
                </Select>
              </View>
              <View className="gap-2">
                <Text className="text-sm font-medium">Price Range</Text>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Input
                      placeholder="Min"
                      keyboardType="decimal-pad"
                      value={webMinPrice}
                      onChangeText={setWebMinPrice}
                    />
                  </View>
                  <Text className="text-muted-foreground pt-2">—</Text>
                  <View className="flex-1">
                    <Input
                      placeholder="Max"
                      keyboardType="decimal-pad"
                      value={webMaxPrice}
                      onChangeText={setWebMaxPrice}
                    />
                  </View>
                </View>
              </View>
              <View className="gap-2">
                <Text className="text-sm font-medium">Sort By</Text>
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(v: any) => {
                    const [sb, so] = (v?.value || 'createdAt-desc').split('-');
                    setSortBy(sb);
                    setSortOrder(so);
                  }}>
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="Newest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc" label="Newest" />
                    <SelectItem value="createdAt-asc" label="Oldest" />
                    <SelectItem value="price-asc" label="Price: Low to High" />
                    <SelectItem value="price-desc" label="Price: High to Low" />
                    <SelectItem value="name-asc" label="Name: A-Z" />
                    <SelectItem value="name-desc" label="Name: Z-A" />
                  </SelectContent>
                </Select>
              </View>
              <Button variant="outline" onPress={applyWebFilters}>
                <Text>Apply Filters</Text>
              </Button>
            </ScrollView>
          </View>
        )}

        <View className="flex-1">
          <View className="border-border flex-row items-center justify-between border-b p-4">
            <Text variant="h2" className="font-bold">Catalog</Text>
            <View className="flex-row gap-2">
              {!isWeb && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => router.push('/(user)/catalog/filters')}>
                  <Icon as={ListFilter} size={16} />
                  <Text>Filters</Text>
                  {activeFilterCount > 0 && (
                    <View className="bg-primary ml-1 size-5 items-center justify-center rounded-full">
                      <Text className="text-primary-foreground text-[10px] font-bold">{activeFilterCount}</Text>
                    </View>
                  )}
                </Button>
              )}
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(v: any) => {
                  const [sb, so] = (v?.value || 'createdAt-desc').split('-');
                  setSortBy(sb);
                  setSortOrder(so);
                }}>
                <SelectTrigger size="sm" className="min-w-[130px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc" label="Newest" />
                  <SelectItem value="createdAt-asc" label="Oldest" />
                  <SelectItem value="price-asc" label="Price: Low to High" />
                  <SelectItem value="price-desc" label="Price: High to Low" />
                  <SelectItem value="name-asc" label="Name: A-Z" />
                  <SelectItem value="name-desc" label="Name: Z-A" />
                </SelectContent>
              </Select>
            </View>
          </View>

          <ScrollView contentContainerClassName="p-4">
            {loading ? (
              <Text className="text-muted-foreground">Loading catalog...</Text>
            ) : products.length === 0 ? (
              <View className="items-center justify-center py-20">
                <Text className="text-muted-foreground text-lg">No products found</Text>
                <Text className="text-muted-foreground text-sm mt-1">Try adjusting your filters</Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-between gap-y-4">
                {products.map((product, index) => (
                  <View key={product.id || index} className="w-[48%] sm:w-[32%] lg:w-[23%]">
                    <ProductCard product={product} />
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
