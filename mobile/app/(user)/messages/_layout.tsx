import { Stack } from 'expo-router';
import React from 'react';

export default function MessagesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, title: 'Messages' }}>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
