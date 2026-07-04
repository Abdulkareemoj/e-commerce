import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatCurrency } from '@/lib/money';
import { Product } from '@/types';
import { Link } from 'expo-router';
import { Star, Heart } from 'lucide-react-native';
import React from 'react';
import { Image, View, Platform, Pressable } from 'react-native';
import { useWishlist } from '@/hooks/useWishlist';

interface ProductCardProps {
  product: Product;
  isSale?: boolean;
}

function Rating({ rating, count }: { rating: number | null; count?: number }) {
  if (!rating) return null;
  const fullStars = Math.floor(rating);
  return (
    <View className="flex-row items-center gap-1">
      <View className="flex-row items-center">
        {[...Array(5)].map((_, i) => (
          <Icon
            key={i}
            as={Star}
            size={12}
            className={i < fullStars ? 'text-amber-400' : 'text-muted-foreground/30'}
            {...(i < fullStars ? { fill: 'currentColor' } : {})}
          />
        ))}
      </View>
      <Text className="text-muted-foreground text-xs">
        {rating.toFixed(1)}
        {count !== undefined && ` (${count})`}
      </Text>
    </View>
  );
}

export function ProductCard({ product, isSale = false }: ProductCardProps) {
  const { isWishlisted, toggle } = useWishlist();

  const handleToggleFavorite = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  const hasDiscount = isSale || (product as any).originalPrice;

  return (
    <Link href={`/(user)/product/${product.id}`} asChild>
      <Pressable
        className={`bg-card shadow-card w-full overflow-hidden rounded-2xl ${
          Platform.OS === 'web' ? 'hover:shadow-card-hover hover:-translate-y-0.5' : ''
        } transition-all duration-200`}>
        <View className="relative">
          <Image
            source={{ uri: product.images[0] }}
            style={{
              width: '100%',
              aspectRatio: 1,
            }}
            className="bg-muted"
            resizeMode="cover"
          />
          {hasDiscount && (
            <View className="bg-primary absolute top-2.5 left-2.5 rounded-lg px-2 py-0.5">
              <Text className="text-primary-foreground text-[10px] font-bold">Sale</Text>
            </View>
          )}
          <Pressable
            onPress={handleToggleFavorite}
            className="bg-background/80 shadow-soft absolute top-2.5 right-2.5 size-8 items-center justify-center rounded-full backdrop-blur-sm">
            <Icon
              as={Heart}
              size={16}
              className={isWishlisted(product.id) ? 'text-rose-500' : 'text-foreground/60'}
              {...(isWishlisted(product.id) ? { fill: 'currentColor' } : {})}
            />
          </Pressable>
        </View>

        <View className="gap-1.5 p-3">
          <Text
            className="text-foreground text-sm font-medium"
            numberOfLines={1}
            ellipsizeMode="tail">
            {product.title}
          </Text>
          <Rating rating={product.rating} />
          <View className="flex-row items-baseline gap-2">
            <Text className="text-primary text-base font-bold">
              {formatCurrency(product.priceCents, product.currency)}
            </Text>
            {hasDiscount && (product as any).originalPrice && (
              <Text className="text-muted-foreground text-xs line-through">
                {formatCurrency((product as any).originalPrice, product.currency)}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
