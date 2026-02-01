import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Search, Clock, X } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/ProductCard';
import { MOCK_PRODUCTS } from '@/app/(user)/(tabs)/home';

// Mock Search Data
const MOCK_RECENT_SEARCHES = ['4K monitor', 'wireless headphones', 'mechanical keyboard'];
const MOCK_POPULAR_PRODUCTS = MOCK_PRODUCTS.slice(0, 2);

export default function SearchScreen() {
  const [searchText, setSearchText] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = () => {
    if (searchText.trim()) {
      setIsSearching(true);
      // In a real app, this would trigger an API call
    } else {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchText('');
    setIsSearching(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="border-b border-border p-4">
        {/* Search Input */}
        <View className="flex-row items-center gap-2">
          <Icon as={Search} size={20} className="text-muted-foreground" />
          <Input
            placeholder="Search products, brands, or categories..."
            className="flex-1"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
          {searchText.length > 0 && (
            <Button variant="ghost" size="icon" onPress={handleClear}>
              <Icon as={X} size={20} />
            </Button>
          )}
        </View>
      </View>

      <ScrollView contentContainerClassName="p-4 gap-6">
        {!isSearching ? (
          <>
            {/* Recent Searches */}
            <View className="gap-3">
              <Text variant="large" className="font-semibold">
                Recent Searches
              </Text>
              {MOCK_RECENT_SEARCHES.map((term) => (
                <Pressable
                  key={term}
                  className="flex-row items-center gap-2 rounded-md p-1 active:bg-muted/50"
                  onPress={() => {
                    setSearchText(term);
                    handleSearch();
                  }}>
                  <Icon as={Clock} size={16} className="text-muted-foreground" />
                  <Text className="text-base">{term}</Text>
                </Pressable>
              ))}
            </View>

            <Separator />

            {/* Popular Products (Quick Links) */}
            <View className="gap-3">
              <Text variant="large" className="font-semibold">
                Popular Products
              </Text>
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
          /* Search Results */
          <View className="gap-4">
            <Text variant="large" className="font-semibold">
              Results for "{searchText}" ({MOCK_PRODUCTS.length} items)
            </Text>
            <View className="flex-row flex-wrap justify-between gap-y-4">
              {MOCK_PRODUCTS.map((product, index) => (
                <View key={index} className="w-[48%] sm:w-[32%] lg:w-[23%]">
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
