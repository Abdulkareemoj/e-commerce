import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ShoppingCart, Heart, Share2, Star } from 'lucide-react-native';
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
import { MOCK_PRODUCTS } from '@/app/(app)/(tabs)/home';

const product = MOCK_PRODUCTS[0];

const MOCK_REVIEWS = [
  { id: 1, user: 'Alice J.', rating: 5, comment: 'Amazing monitor, colors are vibrant!' },
  { id: 2, user: 'Bob K.', rating: 4, comment: 'Great value for the price, fast shipping.' },
];

function ProductImageGallery({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const scrollRef = React.useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const imageWidth = width > 1024 ? width / 2 - 64 : width; // Adjust for web padding/layout

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

      {/* Pagination Indicators */}
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

function ProductOptions() {
  const [selectedSize, setSelectedSize] = React.useState('27"');
  const [selectedColor, setSelectedColor] = React.useState('Black');

  return (
    <View className="gap-4">
      {/* Size Selector */}
      <View>
        <Text className="mb-2 text-base font-semibold">Size: {selectedSize}</Text>
        <View className="flex-row gap-2">
          {['24"', '27"', '32"'].map((size) => (
            <Button
              key={size}
              variant={selectedSize === size ? 'default' : 'outline'}
              size="sm"
              onPress={() => setSelectedSize(size)}>
              <Text>{size}</Text>
            </Button>
          ))}
        </View>
      </View>

      {/* Color Selector */}
      <View>
        <Text className="mb-2 text-base font-semibold">Color: {selectedColor}</Text>
        <View className="flex-row gap-2">
          {['Black', 'White', 'Silver'].map((color) => (
            <Pressable
              key={color}
              className={`size-8 rounded-full border-2 ${
                selectedColor === color ? 'border-primary' : 'border-border'
              }`}
              style={{ backgroundColor: color.toLowerCase() }}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function ProductReviews() {
  return (
    <View className="gap-4">
      {MOCK_REVIEWS.map((review) => (
        <View key={review.id} className="rounded-lg border border-border p-3">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="font-semibold">{review.user}</Text>
            <View className="flex-row">
              {[...Array(review.rating)].map((_, i) => (
                <Icon key={i} as={Star} size={14} className="fill-yellow-500 text-yellow-500" />
              ))}
            </View>
          </View>
          <Text className="text-sm text-muted-foreground">{review.comment}</Text>
        </View>
      ))}
      <Button variant="outline" className="mt-2">
        <Text>See All Reviews</Text>
      </Button>
    </View>
  );
}

export default function ProductDetailScreen() {
  const { width } = useWindowDimensions();
  const isWeb = width >= 1024; // Tailwind 'lg' breakpoint
  const { addItem } = useCart();

  // Mock function for Add to Cart
  const handleAddToCart = async () => {
    // For simplicity, we add 1 unit of the base product
    await addItem(product.id, 1);
    console.log(`Added ${product.title} to cart.`);
    // TODO: Show success toast
  };

  // Mock product images (adding a few more for the carousel demo)
  const mockImages = [
    product.images[0],
    'https://picsum.photos/seed/monitor-side/400/300',
    'https://picsum.photos/seed/monitor-back/400/300',
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        <ScrollView contentContainerClassName="pb-24">
          <View className={`flex-col lg:flex-row ${isWeb ? 'p-8' : 'p-0'}`}>
            {/* Left Column: Images (Full width on mobile, 50% on web) */}
            <ProductImageGallery images={mockImages} />

            {/* Right Column: Details & Purchase Options (Full width on mobile, 50% on web) */}
            <View className="w-full gap-4 p-4 lg:w-1/2 lg:p-8">
              <Text variant="h1" className="font-bold">
                {product.title}
              </Text>
              <View className="flex-row items-center gap-2">
                <Icon as={Star} size={16} className="fill-yellow-500 text-yellow-500" />
                <Text className="text-sm font-medium">{product.rating} (128 Reviews)</Text>
              </View>

              <Text variant="h2" className="font-extrabold text-primary">
                {formatCurrency(product.priceCents, product.currency)}
              </Text>

              <Separator />

              <ProductOptions />

              <Separator />

              {/* Description and Specs Tabs */}
              <Tabs value="description" onValueChange={() => {}}>
                <TabsList className="w-full">
                  <TabsTrigger value="description">
                    <Text>Description</Text>
                  </TabsTrigger>
                  <TabsTrigger value="specs">
                    <Text>Specifications</Text>
                  </TabsTrigger>
                  <TabsTrigger value="reviews">
                    <Text>Reviews</Text>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="p-2">
                  <Text className="text-muted-foreground">{product.description}</Text>
                  <Text className="mt-2 text-sm font-medium text-green-600">
                    In Stock: {product.stock} units
                  </Text>
                </TabsContent>
                <TabsContent value="specs" className="p-2">
                  <Text className="text-muted-foreground">
                    Resolution: 3840x2160 (4K)
                    {'\n'}Refresh Rate: 144Hz
                    {'\n'}Panel Type: IPS
                  </Text>
                </TabsContent>
                <TabsContent value="reviews" className="p-2">
                  <ProductReviews />
                </TabsContent>
              </Tabs>
            </View>
          </View>
        </ScrollView>

        {/* Sticky Footer for Purchase Actions (Mobile Only) */}
        <View className="absolute bottom-0 w-full flex-row gap-3 border-t border-border bg-background/95 p-4 lg:static lg:mt-4 lg:border-none lg:p-0">
          <Button variant="outline" size="icon" className="size-12">
            <Icon as={Heart} size={24} />
          </Button>
          <Button className="flex-1" onPress={handleAddToCart}>
            <Icon as={ShoppingCart} size={20} />
            <Text className="font-semibold">Add to Cart</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
