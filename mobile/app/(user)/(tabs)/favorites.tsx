import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Heart } from 'lucide-react-native';
import { ScrollView, View, Platform } from 'react-native';
import { ProductCard } from '@/components/ProductCard';
import { useWishlist } from '@/hooks/useWishlist';
import { Link } from 'expo-router';

export default function FavoritesScreen() {
  const { items, isLoading, loadWishlist } = useWishlist();

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  if (isLoading) {
    return (
      <View className="bg-background flex-1 items-center justify-center p-4">
        <Text className="text-muted-foreground">Loading wishlist...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View className="bg-background flex-1 items-center justify-center p-6">
        <View className="items-center gap-4">
          <View className="bg-secondary size-24 items-center justify-center rounded-full">
            <Icon as={Heart} size={40} className="text-muted-foreground" />
          </View>
          <View className="items-center gap-2">
            <Text className="text-foreground text-xl font-bold">No Favorites Yet</Text>
            <Text className="text-muted-foreground text-center text-sm">
              Tap the heart icon on products you love{'\n'}to save them here.
            </Text>
          </View>
          <Link href="/(user)/(tabs)/home" asChild>
            <Button className="mt-2 h-12 rounded-2xl">
              <Text className="text-primary-foreground font-semibold">Browse Products</Text>
            </Button>
          </Link>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <ScrollView contentContainerClassName="p-5 pb-8">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-foreground text-xl font-bold">Favorites</Text>
          <Text className="text-muted-foreground text-sm">{items.length} items</Text>
        </View>
        <View className="flex-row flex-wrap justify-between gap-3">
          {items.map((item) => (
            <View
              key={item.id}
              className={Platform.OS === 'web' ? 'w-[31%] lg:w-[23%]' : 'w-[48%]'}>
              <ProductCard product={item.product} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
