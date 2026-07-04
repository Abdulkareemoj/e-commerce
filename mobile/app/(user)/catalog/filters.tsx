import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

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

export default function CatalogFilterScreen() {
  const handleApply = () => {
    // TODO: Apply filters and refresh catalog data
    router.back();
  };

  const handleClear = () => {
    // TODO: Clear all selected filters
  };

  return (
    <SafeAreaView className="bg-background flex-1">
      {/* Header */}
      <View className="border-border flex-row items-center justify-between border-b p-4">
        <Button variant="ghost" size="sm" onPress={handleClear}>
          <Text>Clear All</Text>
        </Button>
        <Text variant="h3" className="font-bold">
          Filters
        </Text>
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <Icon as={X} size={24} />
        </Button>
      </View>

      {/* Filter Content */}
      <ScrollView className="flex-1 p-4">
        <View className="gap-6">
          <FilterSection title="Category" />
          <FilterSection title="Brand" />
          <FilterSection title="Price" />
          {/* Add more filters here */}
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View className="border-border border-t p-4">
        <Button className="w-full" onPress={handleApply}>
          <Text>Show Results</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
