import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { MoonStarIcon, StarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';

const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const SCREEN_OPTIONS = {
  title: 'React Native Reusables',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

export default function Index() {
  const { colorScheme } = useColorScheme();
  // TODO: Hook this up to your actual Auth Context
  // const { user, isLoading, role } = useAuth();

  // MOCK DATA FOR SETUP
  const isLoading = false;
  const user = null; // Set to { id: 1 } to test logged in state
  const role = 'customer'; // 'admin' | 'seller' | 'customer'

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 1. If not logged in, go to Auth group
  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // 2. If logged in, redirect based on role
  switch (role) {
    case 'admin':
      return <Redirect href="/(admin)/dashboard" />;
    case 'vendor':
      return <Redirect href="/(vendor)/products" />;
    case 'customer':
    default:
      return <Redirect href="/(customer)/home" />;
  }
}
const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}
