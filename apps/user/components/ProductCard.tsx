import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatCurrency } from '@/lib/money';
import { Product } from '@/types';
import { Link } from 'expo-router';
import { Heart, ShoppingCart } from 'lucide-react-native';
import React from 'react';
import { Image, View } from 'react-native';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
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

export function ProductCard({ product }: ProductCardProps) {
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
      <Card className="w-full flex-col justify-between p-0 shadow-none sm:w-auto sm:shadow-sm">
        <View className="relative">
          {/* Product Image */}
          <Image
            source={{ uri: product.images[0] }}
            className="h-32 w-full rounded-t-xl bg-muted/50"
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

        <CardContent className="flex-col gap-1 p-3">
          <Text className="line-clamp-2 text-sm font-semibold">{product.title}</Text>
          <Rating rating={product.rating} />
          <Text className="text-lg font-bold text-primary">
            {formatCurrency(product.priceCents, product.currency)}
          </Text>
        </CardContent>

        <CardFooter className="p-3 pt-0">
          <Button className="flex-1" size="sm" onPress={handleAddToCart}>
            <Icon as={ShoppingCart} size={16} />
            <Text>Add</Text>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
