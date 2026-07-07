import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ProductCard } from '@/components/ProductCard';
import { CategoryChips } from '@/components/CategoryChips';
import * as React from 'react';
import { ScrollView, View, Platform, Pressable } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { api } from '@/lib/api';
import { Product, Category } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal } from 'lucide-react-native';

export default function CategoriesScreen() {
  const { width } = useWindowDimensions();
  const isWeb = width >= 1024;

  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          api.publicGet('/products'),
          api.publicGet('/products/categories'),
        ]);
        const mappedProducts = (productsData.products || []).map((p: any) => ({
          ...p,
          title: p.name,
          priceCents: Math.round(parseFloat(p.price || 0) * 100),
          currency: 'USD',
          rating: 4.5,
          attributes: {},
          variants: (p.variants || []).map((v: any) => ({
            ...v,
            priceCents: v.price ? Math.round(parseFloat(v.price) * 100) : null,
          })),
        }));
        const mappedCategories = (categoriesData.categories || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        }));
        setProducts(mappedProducts);
        setCategories(mappedCategories);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <View className="bg-background flex-1">
      <View className="flex-1 flex-row">
        {isWeb && (
          <View className="border-border bg-card hidden w-64 flex-col gap-4 border-r p-4 lg:flex">
            <Text className="text-foreground text-lg font-bold">Filters</Text>
            <View className="gap-4">
              <View className="gap-2">
                <Text className="text-foreground text-sm font-semibold">Category</Text>
                <View className="gap-1">
                  {categories.map((cat) => (
                    <Pressable
                      key={cat.id}
                      onPress={() =>
                        setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
                      }
                      className={`rounded-xl px-3 py-2 ${
                        selectedCategory === cat.id ? 'bg-primary/10' : ''
                      }`}>
                      <Text
                        className={`text-sm ${
                          selectedCategory === cat.id
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground'
                        }`}>
                        {cat.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        <View className="flex-1">
          <View className="border-border bg-card flex-row items-center justify-between border-b px-5 py-3">
            <Text className="text-foreground text-lg font-bold">Catalog</Text>
            <View className="flex-row items-center gap-2">
              <Pressable className="bg-secondary flex-row items-center gap-1.5 rounded-xl px-3 py-2">
                <Icon as={SlidersHorizontal} size={14} className="text-foreground" />
                <Text className="text-foreground text-sm font-medium">Filters</Text>
              </Pressable>
            </View>
          </View>

          <View className="px-1 py-3">
            <CategoryChips
              categories={categories}
              selectedId={selectedCategory}
              onSelect={(cat) => setSelectedCategory(cat?.id ?? null)}
            />
          </View>

          <ScrollView contentContainerClassName="px-5 pb-8">
            <View className="flex-row flex-wrap justify-between gap-3">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <View key={i} className="bg-card shadow-card w-[48%] gap-2 rounded-2xl">
                    <Skeleton className="h-40 w-full rounded-t-2xl" />
                    <View className="gap-1.5 p-3">
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                      <Skeleton className="h-3 w-1/2 rounded-md" />
                      <Skeleton className="h-4 w-1/3 rounded-md" />
                    </View>
                  </View>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <View
                    key={product.id}
                    className={Platform.OS === 'web' ? 'w-[31%] lg:w-[23%]' : 'w-[48%]'}>
                    <ProductCard product={product} />
                  </View>
                ))
              ) : (
                <View className="w-full items-center justify-center py-12">
                  <Text className="text-muted-foreground">No products found.</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
