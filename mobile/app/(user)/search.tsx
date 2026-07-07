import * as React from 'react';
import { ScrollView, View, Pressable, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { Clock, TrendingUp, Search as SearchIcon } from 'lucide-react-native';

const POPULAR_SEARCHES = ['Electronics', 'Headphones', 'Shoes', 'Cameras', 'Laptops', 'Clothing'];

export default function SearchScreen() {
  const [query, setQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);

  const handleSearch = React.useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setLoading(true);

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== searchTerm);
      return [searchTerm, ...filtered].slice(0, 5);
    });

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
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClear = React.useCallback(() => {
    setQuery('');
    setIsSearching(false);
    setSearchResults([]);
  }, []);

  const handleSuggestionPress = React.useCallback(
    (term: string) => {
      setQuery(term);
      handleSearch(term);
    },
    [handleSearch]
  );

  return (
    <View className="bg-background flex-1">
      <View className="bg-card border-border border-b px-5 pt-3 pb-3">
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onSubmit={() => handleSearch(query)}
          placeholder="Search products..."
          autoFocus
        />
      </View>

      <ScrollView contentContainerClassName="px-5 py-4 pb-8" showsVerticalScrollIndicator={false}>
        {!isSearching ? (
          <View className="gap-6">
            {recentSearches.length > 0 && (
              <View className="gap-3">
                <View className="flex-row items-center gap-2">
                  <Icon as={Clock} size={16} className="text-muted-foreground" />
                  <Text className="text-foreground text-sm font-semibold">Recent Searches</Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <Pressable
                      key={term}
                      onPress={() => handleSuggestionPress(term)}
                      className="bg-secondary rounded-full px-4 py-2">
                      <Text className="text-foreground text-sm">{term}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <View className="gap-3">
              <View className="flex-row items-center gap-2">
                <Icon as={TrendingUp} size={16} className="text-muted-foreground" />
                <Text className="text-foreground text-sm font-semibold">Popular Searches</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <Pressable
                    key={term}
                    onPress={() => handleSuggestionPress(term)}
                    className="bg-secondary rounded-full px-4 py-2">
                    <Text className="text-foreground text-sm">{term}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground text-sm">
                {loading ? 'Searching...' : `${searchResults.length} results for "${query}"`}
              </Text>
            </View>

            {loading ? (
              <View className="items-center justify-center gap-2 py-12">
                <Icon as={SearchIcon} size={32} className="text-muted-foreground" />
                <Text className="text-muted-foreground text-sm">Searching...</Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View className="items-center justify-center gap-3 py-12">
                <View className="bg-muted size-16 items-center justify-center rounded-full">
                  <Icon as={SearchIcon} size={32} className="text-muted-foreground" />
                </View>
                <Text className="text-foreground text-base font-semibold">No results found</Text>
                <Text className="text-muted-foreground text-sm">
                  Try different keywords or check spelling
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-between gap-3">
                {searchResults.map((product) => (
                  <View
                    key={product.id}
                    className={Platform.OS === 'web' ? 'w-[31%] lg:w-[23%]' : 'w-[48%]'}>
                    <ProductCard product={product} />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
