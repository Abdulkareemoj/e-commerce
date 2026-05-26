import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Heart } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/ProductCard';
import { useWishlist } from '@/hooks/useWishlist';
import { Link } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';

export default function FavoritesScreen() {
  const { items, isLoading, loadWishlist } = useWishlist();

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background p-4">
        <Text className="text-muted-foreground">Loading wishlist...</Text>
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background p-4">
        <View className="items-center gap-4">
          <View className="size-20 items-center justify-center rounded-full bg-muted">
            <Icon as={Heart} size={32} className="text-muted-foreground" />
          </View>
          <View className="items-center gap-2">
            <Text variant="h3" className="font-bold tracking-tight">
              No Favorites Yet
            </Text>
            <Text className="text-center text-muted-foreground">
              Tap the heart icon on products you love to save them here.
            </Text>
          </View>
          <Link href="/(user)/catalog" asChild>
            <Button className="mt-2">
              <Text className="font-semibold">Browse Products</Text>
              <Icon as={ArrowRight} size={18} />
            </Button>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-4">
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {items.map((item) => (
            <View key={item.id} className="w-[48%] sm:w-[32%] lg:w-[23%]">
              <ProductCard product={item.product} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
