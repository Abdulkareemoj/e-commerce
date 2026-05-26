import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

import { View, ScrollView, Pressable, Platform } from 'react-native';
import { ProductCard } from '@/components/ProductCard';
import { Category, Product } from '@/types';
import { Link } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Smartphone,
  Headphones,
  Laptop,
  Watch,
  Shirt,
  Home as HomeIcon,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react-native';

// Mock Data
export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'All', icon: HomeIcon },
  { id: '2', name: 'Smartphones', icon: Smartphone },
  { id: '3', name: 'Headphones', icon: Headphones },
  { id: '4', name: 'Laptops', icon: Laptop },
  { id: '5', name: 'Wearables', icon: Watch },
  { id: '6', name: 'Apparel', icon: Shirt },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Ultra HD 4K Monitor 27"',
    description: 'Stunning clarity and color accuracy.',
    priceCents: 49999,
    currency: 'USD',
    images: ['https://picsum.photos/seed/monitor/400/300'],
    vendorId: 'v1',
    categoryId: 'c1',
    stock: 10,
    rating: 4.5,
    attributes: {},
    variants: [
      { id: 'v1', productId: 'p1', name: '27 inch', sku: 'MON-27', priceCents: 49999, stock: 10, attributes: { Size: '27"' }, image: null, sortOrder: 0, isAvailable: true },
      { id: 'v2', productId: 'p1', name: '32 inch', sku: 'MON-32', priceCents: 59999, stock: 5, attributes: { Size: '32"' }, image: null, sortOrder: 1, isAvailable: true },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    title: 'Wireless Noise Cancelling Headphones',
    description: 'Immersive sound experience.',
    priceCents: 19999,
    currency: 'USD',
    images: ['https://picsum.photos/seed/headphones/400/300'],
    vendorId: 'v1',
    categoryId: 'c3',
    stock: 50,
    rating: 4.8,
    attributes: {},
    variants: [
      { id: 'v3', productId: 'p2', name: 'Black', sku: 'HP-BLK', priceCents: 19999, stock: 30, attributes: { Color: 'Black' }, image: null, sortOrder: 0, isAvailable: true },
      { id: 'v4', productId: 'p2', name: 'White', sku: 'HP-WHT', priceCents: 20999, stock: 20, attributes: { Color: 'White' }, image: null, sortOrder: 1, isAvailable: true },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    title: 'Ergonomic Mechanical Keyboard',
    description: 'Tactile feedback for peak performance.',
    priceCents: 12999,
    currency: 'USD',
    images: ['https://picsum.photos/seed/keyboard/400/300'],
    vendorId: 'v2',
    categoryId: 'c4',
    stock: 20,
    rating: 4.2,
    attributes: {},
    variants: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p4',
    title: 'High-Performance Gaming Mouse',
    description: 'Precision tracking and customizable buttons.',
    priceCents: 7999,
    currency: 'USD',
    images: ['https://picsum.photos/seed/mouse/400/300'],
    vendorId: 'v2',
    categoryId: 'c4',
    stock: 30,
    rating: 4.6,
    attributes: {},
    variants: [],
    createdAt: new Date().toISOString(),
  },
];

const ICON_MAP: Record<string, React.ComponentProps<typeof Icon>['as']> = {
  HomeIcon,
  Smartphone,
  Headphones,
  Laptop,
  Watch,
  Shirt,
};

function CategoryItem({ category, index }: { category: Category; index: number }) {
  const IconComponent = ICON_MAP[category.icon] || HomeIcon;
  const isActive = category.id === '1';

  return (
    <Link href="/(user)/catalog" asChild>
      <Pressable className="flex-col items-center gap-2.5">
        <View
          className={`size-16 items-center justify-center rounded-2xl transition-all duration-200 ${
            isActive
              ? 'bg-primary shadow-lg shadow-primary/30'
              : 'bg-secondary shadow-sm shadow-black/5'
          }`}>
          <Icon
            as={IconComponent}
            className={isActive ? 'text-primary-foreground' : 'text-foreground'}
            size={26}
          />
        </View>
        <Text
          className={`text-center text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          {category.name}
        </Text>
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    AsyncStorage.getItem('onboarding_dismissed').then((val) => {
      if (!val) setShowWelcome(true);
    });
  }, [user]);

  const dismissWelcome = async () => {
    setShowWelcome(false);
    await AsyncStorage.setItem('onboarding_dismissed', 'true');
  };

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
          icon: 'Shirt',
        }));

        setProducts(mappedProducts);
        setCategories(mappedCategories.length > 0 ? mappedCategories : MOCK_CATEGORIES);
      } catch (err) {
        setError('Failed to load data');
        setCategories(MOCK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerClassName="pb-8 gap-8"
        showsVerticalScrollIndicator={false}
        className="px-4 pt-4">
        {/* Welcome Onboarding */}
        {showWelcome && user && (
          <View className="relative overflow-hidden rounded-2xl bg-primary/10 p-5">
            <Pressable onPress={dismissWelcome} className="absolute right-3 top-3 z-10">
              <Icon as={X} size={18} className="text-muted-foreground" />
            </Pressable>
            <Text variant="h3" className="font-bold tracking-tight mb-1">
              Welcome, {user.name || 'there'}! 👋
            </Text>
            <Text className="text-sm text-muted-foreground mb-4">
              Get started browsing products, saving favorites, and more.
            </Text>
            <View className="flex-row gap-3">
              <Link href="/(user)/catalog" asChild>
                <Button size="sm" variant="default">
                  <Text className="text-xs">Browse Products</Text>
                </Button>
              </Link>
              <Link href="/(user)/(tabs)/profile" asChild>
                <Button size="sm" variant="outline">
                  <Text className="text-xs">My Profile</Text>
                </Button>
              </Link>
            </View>
          </View>
        )}

        {/* Hero Banner */}
        <View className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-6 pb-10 pt-8 shadow-xl shadow-primary/20">
          <View className="absolute right-0 top-0 size-32 -translate-y-1/2 translate-x-1/4 rounded-full bg-white/10" />
          <View className="absolute bottom-0 right-8 size-20 translate-y-1/2 rounded-full bg-white/10" />
          <View className="z-10 gap-2">
            <View className="flex-row items-center gap-2">
              <Icon as={Sparkles} size={20} className="text-white/90" />
              <Text className="text-sm font-medium text-white/90">Exclusive Deal</Text>
            </View>
            <Text variant="h2" className="font-bold tracking-tight text-white">
              Up to 50% Off{'\n'}Tech Collection
            </Text>
            <Text className="mt-1 text-sm text-white/80">Limited time offer. Shop now!</Text>
          </View>
          <Button
            className="mt-4 w-fit bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40"
            variant="secondary">
            <Text className="text-sm font-semibold text-primary">Explore Deals</Text>
          </Button>
        </View>

        {/* Categories Section */}
        <View className="gap-5">
          <View className="flex-row items-center justify-between">
            <Text variant="h3" className="font-bold tracking-tight">
              Categories
            </Text>
            <Link href="/(user)/catalog" asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Text className="text-sm font-medium text-muted-foreground">View all</Text>
                <Icon as={ArrowRight} size={16} className="text-muted-foreground" />
              </Button>
            </Link>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row items-center gap-5">
            {categories.map((cat, index) => (
              <CategoryItem key={cat.id} category={cat} index={index} />
            ))}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View className="gap-5">
          <View className="flex-row items-center justify-between">
            <Text variant="h3" className="font-bold tracking-tight">
              Featured Products
            </Text>
            <Link href="/(user)/catalog" asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Text className="text-sm font-medium text-muted-foreground">See all</Text>
                <Icon as={ArrowRight} size={16} className="text-muted-foreground" />
              </Button>
            </Link>
          </View>

          {loading ? (
            <View className="items-center justify-center py-12">
              <Text className="text-muted-foreground">Loading products...</Text>
            </View>
          ) : error ? (
            <View className="items-center justify-center py-12">
              <Text className="text-destructive">{error}</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap items-center justify-between gap-4">
              {products.length > 0
                ? products.map((product) => (
                    <View
                      key={product.id}
                      className={Platform.OS === 'web' ? 'w-[31%] lg:w-[24%]' : 'w-[48%]'}>
                      <ProductCard product={product} isSale={product.id === 'p2'} categories={[]} />
                    </View>
                  ))
                : MOCK_PRODUCTS.map((product, index) => (
                    <View
                      key={product.id}
                      className={Platform.OS === 'web' ? 'w-[31%] lg:w-[24%]' : 'w-[48%]'}>
                      <ProductCard product={product} isSale={index === 1} categories={[]} />
                    </View>
                  ))}
            </View>
          )}
        </View>

        {/* Trending Section */}
        <View className="gap-5">
          <Text variant="h3" className="font-bold tracking-tight">
            Trending Now
          </Text>
          <View className="flex-row flex-wrap items-center justify-between gap-4">
            {MOCK_PRODUCTS.slice(2, 4).map((product, index) => (
              <View
                key={product.id}
                className={Platform.OS === 'web' ? 'w-[48%] lg:w-[49%]' : 'w-full'}>
                <ProductCard product={product} isSale={false} categories={['Trending']} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
