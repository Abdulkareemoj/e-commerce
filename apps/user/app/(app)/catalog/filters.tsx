import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// Mock Filter Data (reused from catalog.tsx)
const MOCK_FILTERS = {
  categories: ['Electronics', 'Apparel', 'Home Goods', 'Books'],
  brands: ['Brand A', 'Brand B', 'Brand C'],
  priceRanges: ['Under $50', '$50 - $100', '$100 - $500', 'Over $500'],
};

// --- Filter Component (Reusable) ---
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

export default function CatalogFilterScreen() {
  const handleApply = () => {
    // TODO: Apply filters and refresh catalog data
    router.back();
  };

  const handleClear = () => {
    // TODO: Clear all selected filters
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border p-4">
        <Button variant="ghost" size="sm" onPress={handleClear}>
          <Text>Clear All</Text>
        </Button>
        <Text variant="h3" className="font-bold">
          Filters
        </Text>
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <Icon as={X} size={24} />
        </Button>
      </View>

      {/* Filter Content */}
      <ScrollView className="flex-1 p-4">
        <View className="gap-6">
          <FilterSection title="Category" options={MOCK_FILTERS.categories} />
          <FilterSection title="Brand" options={MOCK_FILTERS.brands} />
          <FilterSection title="Price" options={MOCK_FILTERS.priceRanges} />
          {/* Add more filters here */}
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View className="border-t border-border p-4">
        <Button className="w-full" onPress={handleApply}>
          <Text>Show Results (120)</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
