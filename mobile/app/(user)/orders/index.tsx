import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Package, ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '@/lib/money';
import { Link } from 'expo-router';

// Mock Order Data
const MOCK_ORDERS: {
  id: string;
  date: string;
  totalCents: number;
  status: string;
  items: number;
}[] = [
  {
    id: 'ORD-1001',
    date: '2023-10-20',
    totalCents: 54999,
    status: 'Delivered',
    items: 2,
  },
  {
    id: 'ORD-1002',
    date: '2023-11-05',
    totalCents: 19999,
    status: 'Shipped',
    items: 1,
  },
  {
    id: 'ORD-1003',
    date: '2023-12-01',
    totalCents: 7999,
    status: 'Processing',
    items: 3,
  },
];

// --- Components ---

function OrderCard({ order }: { order: (typeof MOCK_ORDERS)[0] }) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'default';
      case 'Shipped':
        return 'secondary';
      case 'Processing':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Link href={`/(app)/orders/${order.id}`} asChild>
      <Pressable>
        <Card className="flex-col gap-3 p-4 active:bg-muted/50">
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-sm font-semibold text-muted-foreground">
                Order ID: {order.id}
              </Text>
              <Text className="text-xs text-muted-foreground">Placed on {order.date}</Text>
            </View>
            <Badge variant={getStatusVariant(order.status)}>
              <Text className="text-xs font-medium">{order.status}</Text>
            </Badge>
          </View>

          <View className="flex-row items-center justify-between">
            <View>
              <Text variant="h3" className="font-bold text-primary">
                {formatCurrency(order.totalCents, 'USD')}
              </Text>
              <Text className="text-sm text-muted-foreground">{order.items} items</Text>
            </View>
            <Icon as={ChevronRight} size={24} className="text-muted-foreground" />
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}

export default function OrdersScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="border-b border-border p-4">
        <Text variant="h2" className="font-bold">
          My Orders
        </Text>
      </View>
      <ScrollView contentContainerClassName="p-4 gap-4">
        {MOCK_ORDERS.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
