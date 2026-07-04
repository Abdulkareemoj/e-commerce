import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Pressable, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import React from 'react';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onSubmit?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search products...',
  autoFocus = false,
  onSubmit,
}: SearchBarProps) {
  return (
    <View className="relative flex-row items-center">
      <View className="pointer-events-none absolute left-3.5 z-10">
        <Icon as={Search} size={18} className="text-muted-foreground" />
      </View>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderClassName="text-muted-foreground"
        autoFocus={autoFocus}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        className="bg-secondary h-12 flex-1 rounded-full border-0 pr-10 pl-10 text-sm"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          className="bg-muted absolute right-3 z-10 size-6 items-center justify-center rounded-full">
          <Icon as={X} size={14} className="text-muted-foreground" />
        </Pressable>
      )}
    </View>
  );
}
