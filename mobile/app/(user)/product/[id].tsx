import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Heart, Share2, ArrowLeft, Check, Truck, Star, Flag } from 'lucide-react-native';
import * as React from 'react';
import {
  ScrollView,
  View,
  Image,
  Platform,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
  Alert,
} from 'react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/money';
import { useCart } from '@/hooks/useCart';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { Product, ProductVariant, Review } from '@/types';
import { StarRating } from '@/components/StarRating';
import { ReviewCard } from '@/components/ReviewCard';
import { ReviewForm } from '@/components/ReviewForm';
import { useAuthStore } from '@/lib/authStore';
import { ProductCard } from '@/components/ProductCard';
import { useWishlist } from '@/hooks/useWishlist';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

function ZoomableImage({ uri, width, height }: { uri: string; width: number; height: number }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
      }
      savedScale.value = scale.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else {
        scale.value = withSpring(2);
        savedScale.value = 2;
      }
    });

  const composed = Gesture.Simultaneous(pinchGesture, doubleTapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={{ width, height, overflow: 'hidden' }}>
        <Animated.Image
          source={{ uri }}
          style={[{ width, height }, animatedStyle]}
          resizeMode="cover"
        />
      </Animated.View>
    </GestureDetector>
  );
}

function ProductImageGallery({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const scrollRef = React.useRef<ScrollView>(null);
  const { width } = useWindowDimensions();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    setActiveIndex(newIndex);
  };

  return (
    <View className="relative w-full">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ height: width > 768 ? 500 : width * 0.9 }}
        contentContainerStyle={{ width: width * images.length }}>
        {images.map((uri, index) => (
          <ZoomableImage
            key={index}
            uri={uri}
            width={width}
            height={width > 768 ? 500 : width * 0.9}
          />
        ))}
      </ScrollView>
      {images.length > 1 && (
        <View className="absolute bottom-4 flex-row justify-center gap-1.5" style={{ width }}>
          {images.map((_, index) => (
            <View
              key={index}
              className={`rounded-full ${
                index === activeIndex ? 'bg-primary h-2 w-2' : 'h-1.5 w-1.5 bg-white/60'
              }`}
            />
          ))}
        </View>
      )}
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
      const selected = variants.find((v) => selectedVariant?.id === v.id && v.attributes?.[key]);
      map[key] = selected?.attributes?.[key] || '';
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
    <View className="gap-4">
      {attrKeys.map((key) => {
        const values = Array.from(
          new Set(variants.filter((v) => v.attributes?.[key]).map((v) => v.attributes![key]))
        );
        const currentValue = selectedAttrValues[key];
        const isColor = key.toLowerCase() === 'color';

        return (
          <View key={key}>
            <Text className="text-foreground mb-2.5 text-sm font-semibold">
              {key}
              {currentValue ? (
                <Text className="text-muted-foreground">: {currentValue}</Text>
              ) : null}
            </Text>
            <View className="flex-row flex-wrap gap-2">
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
                      className={`size-10 items-center justify-center rounded-full border-2 ${
                        isSelected ? 'border-primary' : 'border-border'
                      } ${!available ? 'opacity-30' : ''}`}
                      style={{ backgroundColor: val.toLowerCase() }}>
                      {isSelected && (
                        <View className="items-center justify-center">
                          <Icon as={Check} size={14} className="text-white" />
                        </View>
                      )}
                    </Pressable>
                  );
                }

                return (
                  <Pressable
                    key={val}
                    onPress={() => selectValue(key, val)}
                    className={`h-10 items-center justify-center rounded-xl px-5 ${
                      isSelected ? 'bg-primary' : 'bg-secondary'
                    } ${!available ? 'opacity-30' : ''}`}>
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
    return <Text className="text-muted-foreground text-sm">Loading reviews...</Text>;
  }

  return (
    <View className="gap-4">
      {avgRating !== null ? (
        <View className="bg-card shadow-card flex-row items-center gap-3 rounded-2xl p-4">
          <Text className="text-foreground text-4xl font-bold">{avgRating.toFixed(1)}</Text>
          <View className="gap-1">
            <StarRating rating={avgRating} size={18} />
            <Text className="text-muted-foreground text-xs">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      ) : null}

      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      {reviews.length === 0 && (
        <Text className="text-muted-foreground text-sm">No reviews yet.</Text>
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
          <Button variant="outline" className="rounded-2xl" onPress={() => setShowForm(true)}>
            <Text>Write a Review</Text>
          </Button>
        )
      ) : (
        <Text className="text-muted-foreground text-xs">Sign in to leave a review.</Text>
      )}
    </View>
  );
}

function RelatedProducts({ productId }: { productId: string }) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRelated = async () => {
      try {
        const data = await api.publicGet(`/products/${productId}/related`);
        const mapped = (data.products || []).map((p: any) => ({
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
        }));
        setProducts(mapped);
      } catch (err) {
        console.error('Failed to fetch related products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRelated();
  }, [productId]);

  if (loading || products.length === 0) return null;

  return (
    <View className="mt-6 gap-4">
      <Text className="text-foreground text-lg font-bold">You May Also Like</Text>
      <View className="flex-row flex-wrap justify-between gap-3">
        {products.slice(0, 4).map((product) => (
          <View
            key={product.id}
            className={Platform.OS === 'web' ? 'w-[31%] lg:w-[23%]' : 'w-[48%]'}>
            <ProductCard product={product} />
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const isWeb = width >= 1024;
  const { addItem } = useCart();
  const { isWishlisted, toggle, loadWishlist } = useWishlist();
  const router = useRouter();

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | null>(null);
  const [showReport, setShowReport] = React.useState(false);
  const [reportReason, setReportReason] = React.useState('');
  const [reportDescription, setReportDescription] = React.useState('');
  const [reporting, setReporting] = React.useState(false);
  const [reportSuccess, setReportSuccess] = React.useState(false);

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
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className="text-muted-foreground">Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className="text-muted-foreground">Product not found.</Text>
      </View>
    );
  }

  const effectivePrice = selectedVariant?.priceCents ?? product.priceCents;
  const effectiveStock = selectedVariant?.stock ?? product.stock;
  const displayImages = product.images?.length > 0 ? product.images : [];

  const handleAddToCart = async () => {
    await addItem(product.id, 1, effectivePrice, selectedVariant?.id);
  };

  return (
    <View className="bg-background flex-1">
      <ScrollView contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>
        <View className="relative">
          <ProductImageGallery images={displayImages} />

          <View
            className="absolute top-4 right-4 left-4 flex-row justify-between"
            style={{ zIndex: 10 }}>
            <Pressable
              onPress={() => router.back()}
              className="bg-background/80 shadow-soft size-10 items-center justify-center rounded-full backdrop-blur-sm">
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </Pressable>

            <View className="flex-row gap-2">
              <Pressable
                onPress={() => toggle(product.id)}
                className="bg-background/80 shadow-soft size-10 items-center justify-center rounded-full backdrop-blur-sm">
                <Icon
                  as={Heart}
                  size={20}
                  className={isWishlisted(product.id) ? 'text-rose-500' : 'text-foreground'}
                  {...(isWishlisted(product.id) ? { fill: 'currentColor' } : {})}
                />
              </Pressable>
              <Pressable className="bg-background/80 shadow-soft size-10 items-center justify-center rounded-full backdrop-blur-sm">
                <Icon as={Share2} size={20} className="text-foreground" />
              </Pressable>
            </View>
          </View>
        </View>

        <View className={`gap-5 ${isWeb ? 'mx-auto max-w-3xl px-8 pt-6' : 'px-5 pt-4'}`}>
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground text-xl font-bold">{product.title}</Text>
              <View className="rounded-full bg-emerald-500/10 px-2.5 py-1">
                <Text className="text-xs font-semibold text-emerald-600">On sale</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-1">
                <Icon as={Star} size={16} className="text-amber-400" fill="currentColor" />
                <Text className="text-foreground text-sm font-medium">
                  {product.rating ? product.rating.toFixed(1) : 'New'}
                </Text>
              </View>
              {product.rating && (
                <Text className="text-muted-foreground text-sm">
                  • {((product.rating / 5) * 100).toFixed(0)}% positive
                </Text>
              )}
            </View>
          </View>

          {product.variants && product.variants.length > 0 && (
            <ProductVariantSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariant}
            />
          )}

          <View className="bg-card shadow-card gap-2 rounded-2xl p-4">
            <Text className="text-muted-foreground text-sm">Description</Text>
            <Text className="text-foreground/80 text-sm leading-relaxed">
              {product.description || 'No description available for this product.'}
            </Text>
          </View>

          <View className="bg-card shadow-card flex-row items-center gap-2 rounded-2xl p-4">
            <Icon as={Truck} size={18} className="text-primary" />
            <Text className="text-foreground text-sm">Free delivery on orders over $50</Text>
          </View>

          <View className="gap-3">
            {showReport ? (
              <View className="bg-card shadow-card rounded-2xl p-4 gap-3">
                <Text className="text-foreground font-semibold">Report this product</Text>
                {reportSuccess ? (
                  <View className="items-center gap-2 py-2">
                    <Icon as={Check} size={24} className="text-success" />
                    <Text className="text-muted-foreground text-sm text-center">
                      Thanks for your report. Our team will review it.
                    </Text>
                    <Button variant="ghost" size="sm" onPress={() => { setShowReport(false); setReportSuccess(false); }}>
                      <Text>Close</Text>
                    </Button>
                  </View>
                ) : (
                  <>
                    <View className="gap-2">
                      <Text className="text-muted-foreground text-xs">Reason</Text>
                      {['Spam or misleading', 'Inappropriate content', 'Counterfeit item', 'Prohibited item', 'Other'].map((r) => (
                        <Pressable
                          key={r}
                          onPress={() => setReportReason(r)}
                          className={`rounded-xl border px-3 py-2 ${reportReason === r ? 'border-primary bg-primary/10' : 'border-border'}`}>
                          <Text className={reportReason === r ? 'text-primary text-sm font-medium' : 'text-foreground text-sm'}>{r}</Text>
                        </Pressable>
                      ))}
                    </View>
                    <View className="gap-1">
                      <Text className="text-muted-foreground text-xs">Description (optional)</Text>
                      <Input
                        placeholder="Additional details..."
                        multiline
                        value={reportDescription}
                        onChangeText={setReportDescription}
                        className="min-h-[60px]"
                      />
                    </View>
                    <View className="flex-row gap-2">
                      <Button variant="outline" className="flex-1" onPress={() => setShowReport(false)}>
                        <Text>Cancel</Text>
                      </Button>
                      <Button
                        className="flex-1"
                        disabled={!reportReason || reporting}
                        onPress={async () => {
                          setReporting(true);
                          try {
                            await api.post('/user/reports', {
                              targetType: 'product',
                              targetId: id,
                              reason: reportReason,
                              description: reportDescription || null,
                            });
                            setReportSuccess(true);
                          } catch (err) {
                            console.error('Failed to submit report:', err);
                            Alert.alert('Error', 'Failed to submit report. Please try again.');
                          } finally {
                            setReporting(false);
                          }
                        }}>
                        <Text>{reporting ? 'Submitting...' : 'Submit Report'}</Text>
                      </Button>
                    </View>
                  </>
                )}
              </View>
            ) : (
              <Pressable onPress={() => { setShowReport(true); setReportSuccess(false); setReportReason(''); setReportDescription(''); }}>
                <View className="flex-row items-center gap-2 justify-center py-1">
                  <Icon as={Flag} size={14} className="text-muted-foreground" />
                  <Text className="text-muted-foreground text-xs">Report this product</Text>
                </View>
              </Pressable>
            )}
          </View>

          <Tabs value="reviews" onValueChange={() => {}}>
            <TabsList className="w-full rounded-2xl">
              <TabsTrigger value="reviews" className="flex-1 rounded-xl">
                <Text>Reviews</Text>
              </TabsTrigger>
              <TabsTrigger value="specs" className="flex-1 rounded-xl">
                <Text>Specs</Text>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="reviews" className="mt-4">
              <ProductReviews productId={product.id} />
            </TabsContent>
            <TabsContent value="specs" className="mt-4">
              <View className="bg-card shadow-card gap-3 rounded-2xl p-4">
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground text-sm">SKU</Text>
                  <Text className="text-foreground text-sm font-medium">
                    {selectedVariant?.sku || 'N/A'}
                  </Text>
                </View>
                <View className="bg-border h-px" />
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground text-sm">Stock</Text>
                  <Text className="text-foreground text-sm font-medium">
                    {effectiveStock > 0 ? `${effectiveStock} available` : 'Out of stock'}
                  </Text>
                </View>
              </View>
            </TabsContent>
          </Tabs>

          <RelatedProducts productId={product.id} />
        </View>
      </ScrollView>

      <View
        className="border-border bg-card/95 border-t backdrop-blur-sm"
        style={{ paddingBottom: 16 }}>
        <View
          className={`flex-row items-center gap-4 ${isWeb ? 'mx-auto max-w-3xl px-8' : 'px-5'}`}>
          <View className="flex-1">
            <Text className="text-muted-foreground text-xs">Price</Text>
            <Text className="text-primary text-2xl font-bold">
              {formatCurrency(effectivePrice, product.currency)}
            </Text>
            {effectiveStock > 0 && effectiveStock <= 10 && (
              <View className="mt-1 rounded-lg bg-amber-500/10 px-2 py-1">
                <Text className="text-xs font-semibold text-amber-600">
                  Only {effectiveStock} left in stock
                </Text>
              </View>
            )}
            {effectiveStock > 10 && (
              <View className="mt-1 rounded-lg bg-green-500/10 px-2 py-1">
                <Text className="text-xs font-semibold text-green-600">In Stock</Text>
              </View>
            )}
          </View>
          <Button
            className="h-12 flex-1 rounded-2xl"
            onPress={handleAddToCart}
            disabled={effectiveStock <= 0}>
            <Icon as={ShoppingCart} size={18} />
            <Text className="text-primary-foreground font-semibold">
              {effectiveStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
