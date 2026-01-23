import React from 'react';
import { Text } from '@/components/ui/text';
import { useLocalSearchParams } from 'expo-router';

import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams();
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center p-4">
        <Text variant="h2" className="mb-4">
          Chat Thread
        </Text>
        <Text className="text-center text-muted-foreground">Chatting in thread ID: {id}</Text>
      </View>
    </SafeAreaView>
  );
}
