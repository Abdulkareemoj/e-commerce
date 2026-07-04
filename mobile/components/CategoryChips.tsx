import { Text } from '@/components/ui/text';
import { Pressable, ScrollView, View } from 'react-native';
import React from 'react';

interface Category {
  id: string;
  name: string;
  slug?: string;
}

interface CategoryChipsProps {
  categories: Category[];
  selectedId?: string | null;
  onSelect: (category: Category | null) => void;
  onSeeAll?: () => void;
}

export function CategoryChips({ categories, selectedId, onSelect, onSeeAll }: CategoryChipsProps) {
  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between px-1">
        <Text className="text-foreground text-base font-semibold">Categories</Text>
        {onSeeAll && (
          <Pressable onPress={onSeeAll}>
            <Text className="text-primary text-sm font-medium">See all</Text>
          </Pressable>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-1">
        <Pressable
          onPress={() => onSelect(null)}
          className={`h-9 items-center justify-center rounded-full px-4 ${
            selectedId === null || selectedId === undefined ? 'bg-primary' : 'bg-secondary'
          }`}>
          <Text
            className={`text-sm font-medium ${
              selectedId === null || selectedId === undefined
                ? 'text-primary-foreground'
                : 'text-secondary-foreground'
            }`}>
            All
          </Text>
        </Pressable>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat)}
            className={`h-9 items-center justify-center rounded-full px-4 ${
              selectedId === cat.id ? 'bg-primary' : 'bg-secondary'
            }`}>
            <Text
              className={`text-sm font-medium ${
                selectedId === cat.id ? 'text-primary-foreground' : 'text-secondary-foreground'
              }`}>
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
