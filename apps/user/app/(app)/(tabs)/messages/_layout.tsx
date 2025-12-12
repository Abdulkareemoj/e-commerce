import { Stack } from 'expo-router';
import React from 'react';

export default function MessagesLayout() {
  return <Stack screenOptions={{ headerShown: true, title: 'Messages' }} />;
}
