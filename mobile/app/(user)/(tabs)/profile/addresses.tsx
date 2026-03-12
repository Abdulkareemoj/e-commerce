import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { MapPin, Edit, Trash2, Plus } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/components/ui/badge';

// Mock Address Data
const MOCK_ADDRESSES: {
  id: number;
  label: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}[] = [
  {
    id: 1,
    label: 'Home',
    name: 'Jane Doe',
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zip: '90210',
    isDefault: true,
  },
  {
    id: 2,
    label: 'Work',
    name: 'Jane Doe',
    street: '456 Corporate Ave',
    city: 'Big City',
    state: 'NY',
    zip: '10001',
    isDefault: false,
  },
];

// --- Components ---

function AddressCard({ address }: { address: (typeof MOCK_ADDRESSES)[0] }) {
  return (
    <Card className="flex-col gap-3 border-2 border-border/50 p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-2">
          <Icon as={MapPin} size={20} className="text-primary" />
          <Text variant="large" className="font-bold">
            {address.label}
          </Text>
          {address.isDefault && (
            <Badge variant="default">
              <Text className="text-xs font-medium">Default</Text>
            </Badge>
          )}
        </View>
        <View className="flex-row gap-2">
          <Button variant="ghost" size="icon">
            <Icon as={Edit} size={18} />
          </Button>
          <Button variant="ghost" size="icon">
            <Icon as={Trash2} size={18} className="text-destructive" />
          </Button>
        </View>
      </View>

      <Text className="text-base font-medium">{address.name}</Text>
      <Text className="text-sm text-muted-foreground">
        {address.street}, {address.city}, {address.state} {address.zip}
      </Text>
    </Card>
  );
}

export default function AddressesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-border p-4">
        <Text variant="h2" className="font-bold">
          My Addresses
        </Text>
        <Button size="sm">
          <Icon as={Plus} size={16} />
          <Text>Add New</Text>
        </Button>
      </View>
      <ScrollView contentContainerClassName="p-4 gap-4">
        {MOCK_ADDRESSES.map((address) => (
          <AddressCard key={address.id} address={address} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
