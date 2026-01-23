import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { MapPin, Search, ShoppingCart } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

export function LocationSearchHeader() {
  return (
    <View className="gap-4 p-4">
      {/* Top Row: Title and Cart Icon */}
      <View className="flex-row items-center justify-between">
        <Text variant="h2" className="text-3xl font-bold">
          Discover
        </Text>
        <Button size="icon" variant="ghost">
          <Icon as={ShoppingCart} className="size-6" />
        </Button>
      </View>

      {/* Location and Search Bar */}
      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <Icon as={MapPin} className="size-5 text-primary" />
          <Text className="text-sm font-medium">92 High Street, London</Text>
        </View>
        <View className="relative flex-row items-center">
          <Input
            placeholder="Search the entire shop"
            className="flex-1 pl-10"
            // We use a placeholder icon inside the input for better UX
          />
          <View className="absolute left-3">
            <Icon as={Search} className="size-5 text-muted-foreground" />
          </View>
        </View>
      </View>
    </View>
  );
}
