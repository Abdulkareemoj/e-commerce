import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ProductCard } from '@/components/ProductCard';
import { Grid } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Separator } from '@/components/ui/separator';
import { useWindowDimensions } from 'react-native';
import { api } from '@/lib/api';
import { Product } from '@/types';

function FilterSection({ title }: { title: string }) {
  return (
    <View className="gap-3">
      <Text variant="h4" className="font-semibold">
        {title}
      </Text>
      <View className="py-2">
        <Text className="text-muted-foreground text-sm">No filters available.</Text>
      </View>
      <Separator className="my-2" />
    </View>
  );
}

function WebFilterSidebar() {
  return (
    <View className="border-border hidden w-64 flex-col gap-4 border-r p-4 lg:flex">
      <Text variant="h3" className="font-bold">
        Filters
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <FilterSection title="Category" />
        <FilterSection title="Brand" />
        <FilterSection title="Price" />
        <Button variant="outline" className="mt-4">
          <Text>Clear Filters</Text>
        </Button>
      </ScrollView>
    </View>
  );
}

export default function CatalogScreen() {
  const { width } = useWindowDimensions();
  const isWeb = width >= 1024; // Tailwind 'lg' breakpoint

  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.publicGet('/products');
        const mappedProducts = (res.products || []).map((p: any) => ({
          ...p,
          title: p.name,
          priceCents: Math.round(parseFloat(p.price || 0) * 100),
          currency: 'USD',
          rating: 4.5,
          attributes: {},
        }));
        setProducts(mappedProducts);
      } catch (err) {
        console.error('Failed to load catalog', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <SafeAreaView className="bg-background flex-1">
      <View className="flex-1 flex-row">
        {/* Web Sidebar */}
        {isWeb && <WebFilterSidebar />}

        {/* Main Content Area */}
        <View className="flex-1">
          {/* Header/Toolbar */}
          <View className="border-border flex-row items-center justify-between border-b p-4">
            <Text variant="h2" className="font-bold">
              Catalog
            </Text>
            <View className="flex-row gap-2">
              {/* Mobile Filter Button */}

              {/* Sort Dropdown (Placeholder) */}
              <Button variant="outline" size="sm">
                <Text>Sort: Best Match</Text>
              </Button>

              {/* View Toggle (Placeholder) */}
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Icon as={Grid} size={16} />
                <Text className="sr-only">Grid view</Text>
              </Button>
            </View>
          </View>

          {/* Product Grid */}
          <ScrollView contentContainerClassName="p-4">
            {loading ? (
              <Text className="text-muted-foreground">Loading catalog...</Text>
            ) : (
              <View className="flex-row flex-wrap justify-between gap-y-4">
                {products.length === 0 ? (
                  <Text className="text-muted-foreground">No products available.</Text>
                ) : (
                  products.map((product, index) => (
                    <View key={product.id || index} className="w-[48%] sm:w-[32%] lg:w-[23%]">
                      <ProductCard product={product} />
                    </View>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
