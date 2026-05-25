import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ShoppingCart, Package, Heart, Star, Truck, Check, Minus, Plus, ChevronRight, X } from 'lucide-react-native';
import * as React from 'react';
import {
  ScrollView,
  View,
  Image,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/money';
import { useCart } from '@/hooks/useCart';
import { Pressable } from '@rn-primitives/slot';
import { useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { Product, ProductVariant, Review } from '@/types';
import { StarRating } from '@/components/StarRating';
import { ReviewCard } from '@/components/ReviewCard';
import { ReviewForm } from '@/components/ReviewForm';
import { useAuthStore } from '@/lib/authStore';
import { useWishlist } from '@/hooks/useWishlist';

function ProductImageGallery({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const scrollRef = React.useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const imageWidth = width > 1024 ? width / 2 - 64 : width;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / imageWidth);
    setActiveIndex(newIndex);
  };

  return (
    <View className="w-full p-0 lg:w-1/2 lg:p-4">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="h-80 w-full"
        contentContainerStyle={{ width: imageWidth * images.length }}>
        {images.map((uri, index) => (
          <Image
            key={index}
            source={{ uri }}
            className="h-80 bg-muted/50"
            style={{ width: imageWidth }}
            resizeMode="contain"
          />
        ))}
      </ScrollView>
      <View className="mt-4 flex-row justify-center gap-2">
        {images.map((_, index) => (
          <View
            key={index}
            className={`size-2 rounded-full ${
              index === activeIndex ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </View>
    </View>
  );
}

function ProductVariantSelector({
  variants,
  selectedVariant,
  onSelect,
}: {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelect: (v: ProductVariant) => void;
}) {
  const attrKeys = React.useMemo(() => {
    const keys = new Set<string>();
    variants.forEach((v) => {
      if (v.attributes) Object.keys(v.attributes).forEach((k) => keys.add(k));
    });
    return Array.from(keys);
  }, [variants]);

  const selectedAttrValues = React.useMemo(() => {
    const map: Record<string, string> = {};
    attrKeys.forEach((key) => {
      const selected = variants.find(
        (v) =>
          selectedVariant?.id === v.id &&
          v.attributes?.[key]
      );
      map[key] = selected?.attributes?.[key] || "";
    });
    return map;
  }, [attrKeys, selectedVariant, variants]);

  const selectValue = (attrKey: string, value: string) => {
    const matching = variants.find((v) => {
      if (!v.isAvailable) return false;
      return (
        v.attributes?.[attrKey] === value &&
        attrKeys.every((k) => {
          if (k === attrKey) return true;
          const curVal = selectedAttrValues[k];
          return !curVal || v.attributes?.[k] === curVal;
        })
      );
    });
    if (matching) onSelect(matching);
  };

  if (attrKeys.length === 0) return null;

  return (
    <View className="gap-5">
      {attrKeys.map((key) => {
        const values = Array.from(
          new Set(variants.filter((v) => v.attributes?.[key]).map((v) => v.attributes![key]))
        );
        const currentValue = selectedAttrValues[key];
        const isColor = key.toLowerCase() === "color";

        return (
          <View key={key}>
            <Text className="mb-3 text-sm font-semibold text-foreground">
              {key}
              {currentValue ? <Text className="text-muted-foreground">: {currentValue}</Text> : null}
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {values.map((val) => {
                const available = variants.some(
                  (v) => v.attributes?.[key] === val && v.isAvailable
                );
                const isSelected = currentValue === val;

                if (isColor) {
                  return (
                    <Pressable
                      key={val}
                      onPress={() => selectValue(key, val)}
                      className={`size-9 rounded-full border-2 items-center justify-center ${
                        isSelected ? 'border-primary' : 'border-border'
                      } ${!available ? 'opacity-30' : ''}`}
                      style={{ backgroundColor: val.toLowerCase() }}>
                      {isSelected && <View className="size-3 rounded-full bg-white/80" />}
                    </Pressable>
                  );
                }

                return (
                  <Pressable
                    key={val}
                    onPress={() => selectValue(key, val)}
                    className={`rounded-xl px-4 py-2.5 border-2 ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background'
                    } ${!available ? 'opacity-40 line-through' : ''}`}>
                    <Text
                      className={`text-sm font-medium ${
                        isSelected ? 'text-primary-foreground' : 'text-foreground'
                      }`}>
                      {val}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [avgRating, setAvgRating] = React.useState<number | null>(null);
  const [totalReviews, setTotalReviews] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const user = useAuthStore((s) => s.user);

  const fetchReviews = React.useCallback(async () => {
    try {
      const data = await api.publicGet(`/products/${productId}/reviews`);
      setReviews(data.reviews || []);
      setAvgRating(data.avgRating);
      setTotalReviews(data.totalReviews);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  React.useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  if (loading) {
    return <Text className="text-sm text-muted-foreground">Loading reviews...</Text>;
  }

  return (
    <View className="gap-4">
      {avgRating !== null ? (
        <View className="flex-row items-center gap-3">
          <Text className="text-3xl font-bold">{avgRating.toFixed(1)}</Text>
          <View className="gap-1">
            <StarRating rating={avgRating} size={16} />
            <Text className="text-xs text-muted-foreground">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</Text>
          </View>
        </View>
      ) : null}

      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      {reviews.length === 0 && (
        <Text className="text-sm text-muted-foreground">No reviews yet.</Text>
      )}

      {user ? (
        showForm ? (
          <ReviewForm
            productId={productId}
            onSuccess={() => {
              setShowForm(false);
              fetchReviews();
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <Button variant="outline" onPress={() => setShowForm(true)}>
            <Text>Write a Review</Text>
          </Button>
        )
      ) : (
        <Text className="text-xs text-muted-foreground">Sign in to leave a review.</Text>
      )}
    </View>
  );
}

function VariantBadge({ variant }: { variant: ProductVariant }) {
  const attrStr = variant.attributes
    ? Object.values(variant.attributes).join(" / ")
    : "";

  return (
    <View className="flex-row items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
      <Icon as={Package} size={14} className="text-muted-foreground" />
      <Text className="text-xs text-muted-foreground">{attrStr || variant.name}</Text>
      {variant.sku && (
        <Text className="text-[10px] text-muted-foreground/60">SKU: {variant.sku}</Text>
      )}
    </View>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const isWeb = width >= 1024;
  const { addItem } = useCart();
  const { isWishlisted, toggle, loadWishlist } = useWishlist();
  
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | null>(null);

  React.useEffect(() => {
    loadWishlist();
    const fetchProduct = async () => {
      try {
        const data = await api.publicGet(`/products/${id}`);
        if (data.product) {
          const p = data.product;
          const mapped: Product = {
            ...p,
            title: p.name,
            priceCents: Math.round(parseFloat(p.price || 0) * 100),
            currency: 'USD',
            rating: p.avgRating ?? null,
            attributes: {},
            variants: (p.variants || []).map((v: any) => ({
              ...v,
              priceCents: v.price ? Math.round(parseFloat(v.price) * 100) : null,
            })),
          };
          setProduct(mapped);
          const avail = (mapped.variants || []).find((v) => v.isAvailable);
          if (avail) setSelectedVariant(avail);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text>Loading product...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text>Product not found.</Text>
      </SafeAreaView>
    );
  }

  const effectivePrice = selectedVariant?.priceCents ?? product.priceCents;
  const effectiveStock = selectedVariant?.stock ?? product.stock;
  const displayImages = product.images?.length > 0
    ? product.images
    : ['https://picsum.photos/seed/product/400/300'];

  const handleAddToCart = async () => {
    await addItem(product.id, 1, effectivePrice, selectedVariant?.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        <ScrollView contentContainerClassName="pb-24">
          <View className={`flex-col lg:flex-row ${isWeb ? 'p-8' : 'p-0'}`}>
            <ProductImageGallery images={displayImages} />

            <View className="w-full gap-5 p-4 lg:w-1/2 lg:p-8">
              <View className="gap-2">
                <Text variant="h1" className="font-bold tracking-tight">
                  {product.title}
                </Text>
                <View className="flex-row items-center gap-2">
                  <StarRating rating={product.rating || 0} size={16} />
                  <Text className="text-sm font-medium">
                    {product.rating ? product.rating.toFixed(1) : 'No reviews'}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-baseline gap-3">
                <Text variant="h2" className="font-extrabold text-primary">
                  {formatCurrency(effectivePrice, product.currency)}
                </Text>
                {selectedVariant?.priceCents && selectedVariant.priceCents < product.priceCents && (
                  <Text className="text-base text-muted-foreground line-through">
                    {formatCurrency(product.priceCents, product.currency)}
                  </Text>
                )}
              </View>

              <Separator />

              {product.variants && product.variants.length > 0 ? (
                <>
                  <ProductVariantSelector
                    variants={product.variants}
                    selectedVariant={selectedVariant}
                    onSelect={setSelectedVariant}
                  />
                  {selectedVariant && <VariantBadge variant={selectedVariant} />}
                  <Separator />
                </>
              ) : null}

              <View className="gap-3">
                <View className="flex-row items-center gap-2">
                  <View
                    className={`size-2.5 rounded-full ${
                      effectiveStock > 0 ? 'bg-green-500' : 'bg-destructive'
                    }`}
                  />
                  <Text className="text-sm font-medium text-muted-foreground">
                    {effectiveStock > 0
                      ? `In Stock (${effectiveStock} available)`
                      : 'Out of Stock'}
                  </Text>
                </View>
              </View>

              <Tabs value="description" onValueChange={() => {}}>
                <TabsList className="w-full">
                  <TabsTrigger value="description"><Text>Description</Text></TabsTrigger>
                  <TabsTrigger value="specs"><Text>Specifications</Text></TabsTrigger>
                  <TabsTrigger value="reviews"><Text>Reviews</Text></TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="p-2">
                  <Text className="text-muted-foreground leading-relaxed">{product.description}</Text>
                </TabsContent>
                <TabsContent value="specs" className="p-2">
                  <Text className="text-muted-foreground">
                    SKU: {selectedVariant?.sku || 'N/A'}{'\n'}
                    Category: {product.categoryId || 'General'}
                  </Text>
                </TabsContent>
                <TabsContent value="reviews" className="p-2">
                  <ProductReviews productId={product.id} />
                </TabsContent>
              </Tabs>
            </View>
          </View>
        </ScrollView>

        <View className="absolute bottom-0 w-full flex-row gap-3 border-t border-border bg-background/95 p-4 lg:static lg:mt-4 lg:border-none lg:p-0">
          <Button variant="outline" size="icon" className="size-12" onPress={() => toggle(product.id)}>
            <Icon as={Heart} size={24} className={isWishlisted(product.id) ? 'fill-rose-500 text-rose-500' : ''} />
          </Button>
          <Button
            className="flex-1"
            onPress={handleAddToCart}
            disabled={effectiveStock <= 0}>
            <Icon as={ShoppingCart} size={20} />
            <Text className="font-semibold">
              {effectiveStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
