import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

import {  View, ScrollView, Pressable, Platform } from 'react-native';
import { ProductCard } from '@/components/ProductCard';
import { Category, Product } from '@/types';
import { Link } from 'expo-router';
import { api } from '@/lib/api';
import {
  Smartphone,
  Headphones,
  Laptop,
  Watch,
  Shirt,
  Home as HomeIcon,
} from 'lucide-react-native';

// Mock Data
export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'All', icon: 'HomeIcon' },
  { id: '2', name: 'Smartphones', icon: 'Smartphone' },
  { id: '3', name: 'Headphones', icon: 'Headphones' },
  { id: '4', name: 'Laptops', icon: 'Laptop' },
  { id: '5', name: 'Wearables', icon: 'Watch' },
  { id: '6', name: 'Apparel', icon: 'Shirt' },
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
    createdAt: new Date().toISOString(),
  },
];
// Map string icon names to Lucide components
const ICON_MAP: Record<string, React.ComponentProps<typeof Icon>['as']> = {
  HomeIcon,
  Smartphone,
  Headphones,
  Laptop,
  Watch,
  Shirt,
};

// Components

function CategoryItem({ category }: { category: Category }) {
  const IconComponent = ICON_MAP[category.icon] || HomeIcon;
  const isActive = category.id === '1'; // Mock active state for 'All'

  return (
    <Link href="/(user)/catalog" asChild>
      <Pressable className="flex-col items-center gap-1.5">
        <View
          className={`size-14 items-center justify-center rounded-full ${
            isActive ? 'bg-primary' : 'bg-secondary dark:bg-secondary/50'
          }`}>
          <Icon
            as={IconComponent}
            className={isActive ? 'text-primary-foreground' : 'text-foreground'}
            size={24}
          />
        </View>
        <Text className="text-center text-xs font-medium">{category.name}</Text>
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          api.publicGet('/products'),
          api.publicGet('/products/categories')
        ]);
        
        const mappedProducts = (productsData.products || []).map((p: any) => ({
          ...p,
          title: p.name,
          priceCents: Math.round(parseFloat(p.price || 0) * 100),
          currency: 'USD',
          rating: 4.5, // Mock rating until DB supports reviews
          attributes: {},
        }));

        const mappedCategories = (categoriesData.categories || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          icon: 'Shirt' // Default icon for now
        }));

        setProducts(mappedProducts);
        setCategories(mappedCategories);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerClassName="p-4 gap-6"
        showsVerticalScrollIndicator={false}>
        {/*  Featured/Flash Sale Banner */}
        <View className="h-40 w-full items-center justify-center rounded-xl bg-primary/10 p-4">
          <Text variant="h3" className="text-center text-primary">
            Flash Sale: Up to 50% Off!
          </Text>
          <Text className="text-sm text-primary/80">Ends in 02:34:12</Text>
        </View>

        {/*  Categories Section (Horizontal Scroll) */}
        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text variant="large" className="font-semibold">
              Shop by Category
            </Text>
            <Link href="/(user)/catalog" asChild>
              <Button variant="link" size="sm">
                <Text className="text-sm">See all</Text>
              </Button>
            </Link>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row items-center justify-center gap-4">
            {categories.map((cat) => (
              <CategoryItem key={cat.id} category={cat} />
            ))}
          </ScrollView>
        </View>

        {/*  Recommended Products Section (Responsive Grid) */}
        <View className="gap-4">
          <Text variant="large" className="font-semibold">
            Recommended for you
          </Text>
          {loading ? (
            <Text>Loading products...</Text>
          ) : error ? (
            <Text className="text-red-500">{error}</Text>
          ) : (
            <View className="flex-row flex-wrap items-center justify-center gap-4">
              {products.map((product) => (
                <View
                  key={product.id}
                  className={Platform.OS === 'web' ? 'w-[31%] lg:w-[23%]' : 'w-full'}>
                  <ProductCard
                    product={product}
                    isSale={product.id === 'p2'} // Mock: p2 is on sale
                    categories={['Watch', 'Samsung']}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
