import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Heart } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/ProductCard';
import { MOCK_PRODUCTS } from '@/app/(app)/(tabs)/home';

// Mock Favorites Data (using all mock products)
const MOCK_FAVORITES = MOCK_PRODUCTS.concat(MOCK_PRODUCTS.slice(0, 1));

export default function FavoritesScreen() {
  if (MOCK_FAVORITES.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background p-4">
        <Icon as={Heart} size={48} className="mb-4 text-muted-foreground" />
        <Text variant="h3" className="mb-2">
          No Favorites Yet
        </Text>
        <Text className="mb-6 text-center text-muted-foreground">
          Tap the heart icon on products you love to save them here.
        </Text>
        <Button>
          <Text>Browse Products</Text>
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-4">
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {MOCK_FAVORITES.map((product, index) => (
            <View key={index} className="w-[48%] sm:w-[32%] lg:w-[23%]">
              <ProductCard product={product} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
