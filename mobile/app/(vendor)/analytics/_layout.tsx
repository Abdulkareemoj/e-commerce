import { Stack } from 'expo-router';
import React from 'react';

export default function AnalyticsStackLayout() {
  return <Stack screenOptions={{ headerShown: false, title: 'Analytics' }} />;
}
