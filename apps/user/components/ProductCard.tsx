import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatCurrency } from '@/lib/money';
import { Product } from '@/types';
import { Link } from 'expo-router';
import { Heart, ShoppingCart } from 'lucide-react-native';
import React from 'react';
import { Image, View, Platform } from 'react-native';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
  isSale?: boolean;
  categories?: string[];
}

// Mock Rating Component (since we don't have a dedicated one yet)
function Rating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;
  const stars = [];

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Text key={`full-${i}`} className="text-yellow-500">
        ★
      </Text>
    );
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Text key={`empty-${i}`} className="text-muted-foreground/50">
        ★
      </Text>
    );
  }

  return <View className="flex-row">{stars}</View>;
}

export function ProductCard({ product, isSale = false, categories = [] }: ProductCardProps) {
  const { addItem } = useCart();

  // Mock function for adding to cart
  const handleAddToCart = async (e: any) => {
    e.preventDefault(); // Prevent navigation when clicking the button inside the Link
    e.stopPropagation();

    // For simplicity, we add 1 unit of the base product
    await addItem(product.id, 1);
    console.log(`Added ${product.title} to cart.`);
    // TODO: Show success toast
  };

  // Mock function for toggling favorite status
  const handleToggleFavorite = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Toggling favorite status for ${product.title}.`);
    // TODO: Integrate useFavorites hook here
  };

  return (
    <Link href={`/(app)/product/${product.id}`} asChild>
      <Card
        className={`w-full flex-col justify-between p-0 ${Platform.OS === 'web' ? 'shadow-sm' : 'shadow-none'}`}>
        <View className="relative">
          {/* SALE Badge */}
          {isSale && (
            <View className="absolute left-3 top-3 z-10 rounded-sm bg-red-500 px-2 py-1">
              <Text className="text-xs font-bold text-white">SALE</Text>
            </View>
          )}
          {/* Product Image */}
          <Image
            source={{ uri: product.images[0] }}
            // Larger, centered product image on web; slightly smaller on native
            style={{
              width: '100%',
              height: Platform.OS === 'web' ? 200 : 160,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
            className={Platform.OS === 'web' ? 'bg-muted/50' : 'bg-muted/50'}
            resizeMode="cover"
          />
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 size-8 rounded-full bg-background/70"
            onPress={handleToggleFavorite}>
            <Icon as={Heart} className="text-primary" size={16} />
          </Button>
        </View>

        <CardContent className="flex-col gap-2 p-3">
          <Text className="line-clamp-2 text-sm font-semibold">{product.title}</Text>
          <Rating rating={product.rating} />
          <Text className="text-lg font-bold text-primary">
            {formatCurrency(product.priceCents, product.currency)}
          </Text>
          {/* Category Tags */}
          {categories && categories.length > 0 && (
            <View className="flex-row flex-wrap gap-1">
              {categories.map((cat, idx) => (
                <View key={idx} className="rounded-full bg-primary/10 px-2 py-1">
                  <Text className="text-xs font-medium text-primary">{cat}</Text>
                </View>
              ))}
            </View>
          )}
          {/* Divider Line */}
        </CardContent>

        <CardFooter className="p-3 pt-0">
          <Button className="flex-1" size="sm" onPress={handleAddToCart}>
            <Icon as={ShoppingCart} size={16} />
            <Text>Add to Cart</Text>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
