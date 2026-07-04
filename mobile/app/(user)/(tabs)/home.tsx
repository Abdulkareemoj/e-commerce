import React, { useEffect, useState } from 'react';
import { Text } from '@/components/ui/text';
import { View, ScrollView, Pressable, Platform } from 'react-native';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { CategoryChips } from '@/components/CategoryChips';
import { HeroBanner } from '@/components/HeroBanner';
import { Category, Product } from '@/types';
import { Link, useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import { Skeleton } from '@/components/ui/skeleton';

function ProductCardSkeleton() {
  return (
    <View className="bg-card shadow-card w-[48%] gap-2 rounded-2xl">
      <Skeleton className="h-40 w-full rounded-t-2xl" />
      <View className="gap-1.5 p-3">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
        <Skeleton className="h-4 w-1/3 rounded-md" />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
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
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory) {
      const category = categories.find((c) => c.id === selectedCategory);
      if (category && !(p as any).categoryId) return false;
    }
    return true;
  });

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getGreeting = () => {
    if (!user) return 'Discover';
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View className="bg-background flex-1">
      <ScrollView contentContainerClassName="pb-8 gap-6" showsVerticalScrollIndicator={false}>
        <View className="gap-5 px-5 pt-2">
          <Text className="text-foreground text-2xl font-bold">
            {getGreeting()}
            {user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </Text>

          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={handleSearchSubmit}
            placeholder="Search products..."
          />
        </View>

        <View className="px-4">
          <HeroBanner
            title="Clearance Sales"
            subtitle="Up to 50% Off"
            badge="%"
            onPress={() => router.push('/(user)/catalog')}
          />
        </View>

        <View className="gap-1 px-4">
          <CategoryChips
            categories={categories}
            selectedId={selectedCategory}
            onSelect={(cat) => setSelectedCategory(cat?.id ?? null)}
            onSeeAll={() => router.push('/(user)/catalog')}
          />
        </View>

        <View className="gap-4 px-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground text-lg font-bold">Featured Products</Text>
            <Link href="/(user)/catalog" asChild>
              <Pressable>
                <Text className="text-primary text-sm font-medium">See all</Text>
              </Pressable>
            </Link>
          </View>

          {loading ? (
            <View className="flex-row flex-wrap justify-between gap-3">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </View>
          ) : filteredProducts.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-muted-foreground">No products available yet.</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between gap-3">
              {filteredProducts.slice(0, 6).map((product) => (
                <View
                  key={product.id}
                  className={Platform.OS === 'web' ? 'w-[31%] lg:w-[23%]' : 'w-[48%]'}>
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
          )}
        </View>

        {products.length >= 4 && (
          <View className="gap-4 px-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground text-lg font-bold">Trending Now</Text>
              <Link href="/(user)/catalog" asChild>
                <Pressable>
                  <Text className="text-primary text-sm font-medium">See all</Text>
                </Pressable>
              </Link>
            </View>
            <View className="flex-row flex-wrap justify-between gap-3">
              {products.slice(2, 5).map((product) => (
                <View
                  key={product.id}
                  className={Platform.OS === 'web' ? 'w-[31%] lg:w-[31%]' : 'w-full'}>
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
