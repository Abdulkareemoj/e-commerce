import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/ProductCard';
import { MOCK_PRODUCTS } from '@/app/(user)/(tabs)/home';
import { api } from '@/lib/api';
import { Search, Clock, X } from 'lucide-react-native';

const searchSchema = z.object({
  query: z.string().min(1),
});

type SearchData = z.infer<typeof searchSchema>;

const MOCK_RECENT_SEARCHES = ['4K monitor', 'wireless headphones', 'mechanical keyboard'];
const MOCK_POPULAR_PRODUCTS = MOCK_PRODUCTS.slice(0, 2);

export default function SearchScreen() {
  const [isSearching, setIsSearching] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);

  const { handleSubmit, setValue, watch } = useForm<SearchData>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: '' },
  });

  const queryValue = watch('query');

  const handleSearch = React.useCallback(async (data?: SearchData, term?: string) => {
    const searchTerm = term || data?.query || '';
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setLoading(true);
    try {
      const res = await api.publicGet(`/products?search=${encodeURIComponent(searchTerm)}`);
      const mappedProducts = (res.products || []).map((p: any) => ({
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
      setSearchResults(mappedProducts);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClear = React.useCallback(() => {
    setValue('query', '');
    setIsSearching(false);
    setSearchResults([]);
  }, [setValue]);

  const onRecentSearch = React.useCallback((term: string) => {
    setValue('query', term);
    handleSearch(undefined, term);
  }, [setValue, handleSearch]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="border-b border-border p-4">
        <View className="flex-row items-center gap-2">
          <Icon as={Search} size={20} className="text-muted-foreground" />
          <Input
            placeholder="Search products, brands, or categories..."
            className="flex-1"
            onChangeText={(v) => setValue('query', v)}
            value={queryValue}
            onSubmitEditing={() => handleSubmit((d) => handleSearch(d))()}
          />
          {queryValue.length > 0 && (
            <Button variant="ghost" size="icon" onPress={handleClear}>
              <Icon as={X} size={20} />
            </Button>
          )}
        </View>
      </View>

      <ScrollView contentContainerClassName="p-4 gap-6">
        {!isSearching ? (
          <>
            <View className="gap-3">
              <Text variant="large" className="font-semibold">Recent Searches</Text>
              {MOCK_RECENT_SEARCHES.map((term) => (
                <Pressable
                  key={term}
                  className="flex-row items-center gap-2 rounded-md p-1 active:bg-muted/50"
                  onPress={() => onRecentSearch(term)}>
                  <Icon as={Clock} size={16} className="text-muted-foreground" />
                  <Text className="text-base">{term}</Text>
                </Pressable>
              ))}
            </View>

            <Separator />

            <View className="gap-3">
              <Text variant="large" className="font-semibold">Popular Products</Text>
              <View className="flex-row flex-wrap justify-between gap-y-4">
                {MOCK_POPULAR_PRODUCTS.map((product) => (
                  <View key={product.id} className="w-[48%] sm:w-[32%] lg:w-[23%]">
                    <ProductCard product={product} />
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View className="gap-4">
            <Text variant="large" className="font-semibold">
              Results for "{queryValue}" ({searchResults.length} items)
            </Text>
            {loading ? (
              <Text className="text-muted-foreground p-4">Searching...</Text>
            ) : (
              <View className="flex-row flex-wrap justify-between gap-y-4">
                {searchResults.map((product) => (
                  <View key={product.id} className="w-[48%] sm:w-[32%] lg:w-[23%]">
                    <ProductCard product={product} />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
