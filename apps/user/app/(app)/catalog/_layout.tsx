import { Stack } from 'expo-router';
import React from 'react';

export default function CatalogStackLayout() {
  return <Stack screenOptions={{ headerShown: false, title: 'Catalog' }} />;
}
