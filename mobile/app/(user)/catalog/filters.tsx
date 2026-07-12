import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { X, Check } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function CatalogFilterScreen() {
  const incoming = useLocalSearchParams<{
    categoryId?: string;
    categoryName?: string;
    minPrice?: string;
    maxPrice?: string;
  }>();

  const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState(incoming.categoryId || '');
  const [minPrice, setMinPrice] = React.useState(incoming.minPrice || '');
  const [maxPrice, setMaxPrice] = React.useState(incoming.maxPrice || '');

  React.useEffect(() => {
    api.publicGet('/products/categories').then((res) => {
      setCategories(res.categories || []);
    }).catch(() => {});
  }, []);

  const handleApply = () => {
    const params: Record<string, string> = {};
    if (selectedCategoryId) params.categoryId = selectedCategoryId;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    router.replace({ pathname: '/(user)/catalog', params });
  };

  const handleClear = () => {
    setSelectedCategoryId('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <View className="bg-background flex-1">
      <View className="border-border flex-row items-center justify-between border-b p-4">
        <Button variant="ghost" size="sm" onPress={handleClear}>
          <Text>Clear All</Text>
        </Button>
        <Text variant="h3" className="font-bold">Filters</Text>
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <Icon as={X} size={24} />
        </Button>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="gap-6">
          <View className="gap-3">
            <Text variant="h4" className="font-semibold">Category</Text>
            <View className="gap-1">
              <Pressable
                onPress={() => setSelectedCategoryId('')}
                className={cn(
                  'flex-row items-center justify-between rounded-xl px-3 py-2.5',
                  !selectedCategoryId ? 'bg-primary/10' : 'active:bg-secondary/50',
                )}>
                <Text className={!selectedCategoryId ? 'text-primary font-medium' : ''}>All Categories</Text>
                {!selectedCategoryId && <Icon as={Check} size={16} className="text-primary" />}
              </Pressable>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategoryId(cat.id)}
                  className={cn(
                    'flex-row items-center justify-between rounded-xl px-3 py-2.5',
                    selectedCategoryId === cat.id ? 'bg-primary/10' : 'active:bg-secondary/50',
                  )}>
                  <Text className={selectedCategoryId === cat.id ? 'text-primary font-medium' : ''}>{cat.name}</Text>
                  {selectedCategoryId === cat.id && <Icon as={Check} size={16} className="text-primary" />}
                </Pressable>
              ))}
            </View>
            <Separator className="my-2" />
          </View>

          <View className="gap-3">
            <Text variant="h4" className="font-semibold">Price Range</Text>
            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <Text className="text-muted-foreground mb-1 text-xs">Min</Text>
                <Input
                  placeholder="$0"
                  keyboardType="decimal-pad"
                  value={minPrice}
                  onChangeText={setMinPrice}
                />
              </View>
              <Text className="text-muted-foreground pt-5">—</Text>
              <View className="flex-1">
                <Text className="text-muted-foreground mb-1 text-xs">Max</Text>
                <Input
                  placeholder="$999"
                  keyboardType="decimal-pad"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                />
              </View>
            </View>
            <Separator className="my-2" />
          </View>
        </View>
      </ScrollView>

      <View className="border-border border-t p-4">
        <Button className="w-full" onPress={handleApply}>
          <Text>Show Results</Text>
        </Button>
      </View>
    </View>
  );
}
