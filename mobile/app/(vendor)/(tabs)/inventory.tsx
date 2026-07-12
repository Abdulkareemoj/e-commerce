import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { View, ScrollView, Pressable } from 'react-native';
import { api } from '@/lib/api';
import { AlertTriangle, Package, ChevronDown, ChevronUp } from 'lucide-react-native';

const stockSchema = z.object({
  stock: z.string().min(1).regex(/^\d+$/),
});

function LowStockItem({
  item,
  type,
  onUpdate,
}: {
  item: any;
  type: 'product' | 'variant';
  onUpdate: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const { control, handleSubmit, setValue } = useForm({
    resolver: zodResolver(stockSchema),
    defaultValues: { stock: String(item.stock) },
  });

  const [inputValue, setInputValue] = React.useState(String(item.stock));

  React.useEffect(() => {
    if (editing) setInputValue(String(item.stock));
  }, [editing, item.stock]);

  const save = React.useCallback(async () => {
    setSaving(true);
    try {
      const endpoint =
        type === 'product'
          ? `/vendor/inventory/products/${item.productId}/stock`
          : `/vendor/inventory/variants/${item.variantId}/stock`;
      await api.put(endpoint, { stock: parseInt(inputValue, 10) });
      setEditing(false);
      onUpdate();
    } catch (err) {
      console.error('Failed to update stock:', err);
    } finally {
      setSaving(false);
    }
  }, [inputValue, item, type, onUpdate]);

  return (
    <View className="border-border flex-row items-center justify-between rounded-lg border p-3">
      <View className="flex-1 gap-1">
        <Text className="text-sm font-medium">{item.productName}</Text>
        {type === 'variant' && (
          <Text className="text-muted-foreground text-xs">
            Variant: {item.variantName} (SKU: {item.sku})
          </Text>
        )}
        <View className="flex-row items-center gap-2">
          <Text
            className={`text-xs font-semibold ${item.stock === 0 ? 'text-destructive' : 'text-amber-500'}`}>
            {item.stock} in stock
          </Text>
          <Badge variant="outline">
            <Icon as={AlertTriangle} size={10} className="text-amber-500" />
            <Text className="text-[10px]">Below {item.threshold}</Text>
          </Badge>
        </View>
      </View>

      {editing ? (
        <View className="flex-row items-center gap-2">
          <Input
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType="numeric"
            className="h-8 w-20 text-sm"
          />
          <Button size="sm" onPress={save} disabled={saving}>
            <Text className="text-xs">{saving ? '...' : 'Save'}</Text>
          </Button>
          <Button size="sm" variant="ghost" onPress={() => setEditing(false)}>
            <Text className="text-xs">Cancel</Text>
          </Button>
        </View>
      ) : (
        <Button size="sm" variant="outline" onPress={() => setEditing(true)}>
          <Text className="text-xs">Update</Text>
        </Button>
      )}
    </View>
  );
}

export default function InventoryScreen() {
  const [data, setData] = React.useState<{
    lowStockProducts: any[];
    lowStockVariants: any[];
    total: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showVariants, setShowVariants] = React.useState(false);

  const fetchLowStock = React.useCallback(async () => {
    try {
      const res = await api.get('/vendor/inventory/low-stock?threshold=10');
      setData(res);
    } catch (err) {
      console.error('Failed to load low stock:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLowStock();
  }, [fetchLowStock]);

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className="text-muted-foreground">Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <ScrollView contentContainerClassName="p-4 gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-foreground text-lg font-bold">Inventory Alerts</Text>
          {data && data.total > 0 && (
            <View className="bg-destructive/10 rounded-full px-2 py-0.5">
              <Text className="text-destructive text-[10px] font-semibold">
                {data.total} low stock
              </Text>
            </View>
          )}
        </View>

        {data?.lowStockProducts.length === 0 && data?.lowStockVariants.length === 0 ? (
          <View className="items-center gap-3 py-10">
            <View className="bg-success/10 size-16 items-center justify-center rounded-full">
              <Icon as={Package} size={28} className="text-success" />
            </View>
            <Text className="text-muted-foreground text-center">All products are well-stocked</Text>
          </View>
        ) : (
          <>
            {data?.lowStockProducts.length ? (
              <View className="gap-2">
                <Text className="text-muted-foreground text-sm font-semibold">
                  Products ({data.lowStockProducts.length})
                </Text>
                {data.lowStockProducts.map((item) => (
                  <LowStockItem
                    key={item.productId}
                    item={item}
                    type="product"
                    onUpdate={fetchLowStock}
                  />
                ))}
              </View>
            ) : null}

            {data?.lowStockVariants.length ? (
              <View className="gap-2">
                <Pressable
                  onPress={() => setShowVariants(!showVariants)}
                  className="flex-row items-center justify-between">
                  <Text className="text-muted-foreground text-sm font-semibold">
                    Variants ({data.lowStockVariants.length})
                  </Text>
                  <Icon
                    as={showVariants ? ChevronUp : ChevronDown}
                    size={18}
                    className="text-muted-foreground"
                  />
                </Pressable>
                {showVariants &&
                  data.lowStockVariants.map((item: any) => (
                    <LowStockItem
                      key={item.variantId}
                      item={item}
                      type="variant"
                      onUpdate={fetchLowStock}
                    />
                  ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
