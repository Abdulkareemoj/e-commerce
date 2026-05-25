import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatCurrency } from '@/lib/money';
import { Product } from '@/types';
import { Link } from 'expo-router';
import { Heart, ShoppingCart, Star } from 'lucide-react-native';
import React from 'react';
import { Image, View, Platform, Pressable } from 'react-native';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';

interface ProductCardProps {
  product: Product;
  isSale?: boolean;
  categories?: string[];
}

function Rating({ rating }: { rating: number | null }) {
  const fullStars = rating ? Math.floor(rating) : 0;
  return (
    <View className="flex-row items-center gap-1">
      <View className="flex-row">
        {[...Array(5)].map((_, i) => (
          <Icon
            key={i}
            as={Star}
            size={12}
            className={i < fullStars ? 'text-amber-400' : 'text-muted-foreground/30'}
          />
        ))}
      </View>
      {rating !== null && (
        <Text className="text-xs text-muted-foreground">{rating.toFixed(1)}</Text>
      )}
    </View>
  );
}

export function ProductCard({ product, isSale = false, categories = [] }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  const handleAddToCart = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(product.id, 1);
  };

  const handleToggleFavorite = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <Link href={`/(user)/product/${product.id}`} asChild>
      <Pressable
        className={`w-full ${Platform.OS === 'web' ? 'hover:scale-[1.02] active:scale-[0.98]' : ''} transition-transform duration-200`}>
        <Card className="w-full flex-col justify-between overflow-hidden p-0">
          <View className="relative">
            {isSale && (
              <View className="absolute left-3 top-3 z-10 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 px-2.5 py-1 shadow-lg shadow-rose-500/30">
                <Text className="text-[10px] font-bold uppercase tracking-wide text-white">
                  Sale
                </Text>
              </View>
            )}
            <Image
              source={{ uri: product.images[0] }}
              style={{
                width: '100%',
                height: Platform.OS === 'web' ? 180 : 140,
              }}
              className="bg-muted"
              resizeMode="cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 size-8 rounded-full bg-background/80 shadow-sm backdrop-blur-sm active:bg-background"
              onPress={handleToggleFavorite}>
              <Icon as={Heart} className={isWishlisted(product.id) ? 'fill-rose-500 text-rose-500' : 'text-foreground'} size={16} />
            </Button>
          </View>

          <CardContent className="flex-col gap-2 p-3.5">
            <Text className="line-clamp-2 text-sm font-medium leading-snug tracking-tight">
              {product.title}
            </Text>
            <Rating rating={product.rating} />
            <View className="flex-row items-baseline justify-between">
              <Text className="text-base font-bold text-primary">
                {formatCurrency(product.priceCents, product.currency)}
              </Text>
              {isSale && (
                <Text className="text-xs text-muted-foreground line-through">
                  {formatCurrency(Math.round(product.priceCents * 1.5), product.currency)}
                </Text>
              )}
            </View>
            {categories && categories.length > 0 && (
              <View className="flex-row flex-wrap gap-1.5 pt-1">
                {categories.slice(0, 2).map((cat, idx) => (
                  <View key={idx} className="rounded-full bg-accent px-2.5 py-0.5">
                    <Text className="text-[10px] font-medium text-accent-foreground">{cat}</Text>
                  </View>
                ))}
              </View>
            )}
          </CardContent>

          <CardFooter className="p-3 pt-0">
            <Button className="flex-1" size="sm" onPress={handleAddToCart}>
              <Icon as={ShoppingCart} size={14} />
              <Text className="text-xs font-medium">Add to Cart</Text>
            </Button>
          </CardFooter>
        </Card>
      </Pressable>
    </Link>
  );
}
