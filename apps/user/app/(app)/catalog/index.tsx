import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ProductCard } from '@/components/ProductCard';
import { MOCK_PRODUCTS } from '@/app/(app)/home'; // Reusing mock data
import { Filter, Grid, List, SlidersHorizontal, X } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useWindowDimensions } from 'react-native';

// Mock Filter Data
const MOCK_FILTERS = {
  categories: ['Electronics', 'Apparel', 'Home Goods', 'Books'],
  brands: ['Brand A', 'Brand B', 'Brand C'],
  priceRanges: ['Under $50', '$50 - $100', '$100 - $500', 'Over $500'],
};

// --- Filter Component (Reusable for both Sheet and Sidebar) ---
function FilterSection({ title, options }: { title: string; options: string[] }) {
  return (
    <View className="gap-3">
      <Text variant="h4" className="font-semibold">
        {title}
      </Text>
      <View className="gap-2">
        {options.map((option) => (
          <View key={option} className="flex-row items-center gap-2">
            <Checkbox id={option} checked={false} onCheckedChange={() => {}} />
            <Text nativeID={option} className="text-sm">
              {option}
            </Text>
          </View>
        ))}
      </View>
      <Separator className="my-2" />
    </View>
  );
}

// --- Web Filter Sidebar ---
function WebFilterSidebar() {
  return (
    <View className="hidden w-64 flex-col gap-4 border-r border-border p-4 lg:flex">
      <Text variant="h3" className="font-bold">
        Filters
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <FilterSection title="Category" options={MOCK_FILTERS.categories} />
        <FilterSection title="Brand" options={MOCK_FILTERS.brands} />
        <FilterSection title="Price" options={MOCK_FILTERS.priceRanges} />
        <Button variant="outline" className="mt-4">
          <Text>Clear Filters</Text>
        </Button>
      </ScrollView>
    </View>
  );
}

export default function CatalogScreen() {
  const { width } = useWindowDimensions();
  const isWeb = width >= 1024; // Tailwind 'lg' breakpoint

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 flex-row">
        {/* Web Sidebar */}
        {isWeb && <WebFilterSidebar />}

        {/* Main Content Area */}
        <View className="flex-1">
          {/* Header/Toolbar */}
          <View className="flex-row items-center justify-between border-b border-border p-4">
            <Text variant="h2" className="font-bold">
              Catalog
            </Text>
            <View className="flex-row gap-2">
              {/* Mobile Filter Button */}

              {/* Sort Dropdown (Placeholder) */}
              <Button variant="outline" size="sm">
                <Text>Sort: Best Match</Text>
              </Button>

              {/* View Toggle (Placeholder) */}
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Icon as={Grid} size={16} />
              </Button>
            </View>
          </View>

          {/* Product Grid */}
          <ScrollView contentContainerClassName="p-4">
            <View className="flex-row flex-wrap justify-between gap-y-4">
              {MOCK_PRODUCTS.concat(MOCK_PRODUCTS).map((product, index) => (
                <View key={index} className="w-[48%] sm:w-[32%] lg:w-[23%]">
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
