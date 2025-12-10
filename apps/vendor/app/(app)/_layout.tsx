import { Icon } from '@/components/ui/icon';
import Drawer from 'expo-router/drawer';

import {
  ShoppingCart,
  Search,
  User,
  Settings,
  LayoutGrid,
  LogOut,
  Package,
  BarChart3,
  MessageSquare,
} from 'lucide-react-native'; // Import LogOut icon
import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  DrawerToggleButton,
} from '@react-navigation/drawer';
import { Text } from '@/components/ui/text';
import { Link, usePathname, router } from 'expo-router'; // Import router for redirection
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/authStore'; // Import auth store

// --- Custom Components for Header ---

// Placeholder for Cart Button
function CartButton() {
  return (
    <Link href="/(app)/(tabs)/orders" asChild>
      <Pressable className="p-2">
        <Icon as={Package} size={24} className="text-foreground" />
      </Pressable>
    </Link>
  );
}

// Placeholder for Search Button
function SearchButton() {
  return (
    <Link href="/(app)/products" asChild>
      <Pressable className="p-2">
        <Icon as={Search} size={24} className="text-foreground" />
      </Pressable>
    </Link>
  );
}

// --- Custom Drawer Content ---

function CustomDrawerContent(props: any) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore(); // Get user and clearAuth from store

  const handleLogout = () => {
    clearAuth(); // Clear auth state and tokens
    router.replace('/(auth)/sign-in'); // Redirect to sign-in page
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
      {/* User Profile Summary */}
      <View
        style={{ paddingTop: insets.top }}
        className="border-b border-border bg-secondary/50 p-4">
        {user ? (
          <>
            <Text variant="h3" className="py-4 font-bold">
              {user.name}
            </Text>
            <Text className="text-sm text-muted-foreground">{user.email}</Text>
          </>
        ) : (
          <Text className="py-4 font-bold">Guest Vendor</Text>
        )}
      </View>

      {/* Drawer Items */}
      <DrawerItemList {...props} />

      {/* Logout Button */}
      <DrawerItem
        label="Logout"
        onPress={handleLogout}
        icon={({ color, size }) => <Icon as={LogOut} size={size} color={color} />}
      />
    </DrawerContentScrollView>
  );
}

// --- Main Layout ---

export default function AppLayout() {
  const headerLeft = () => (
    <View className="ml-2 h-full flex-row items-center justify-center">
      <CartButton />
      <SearchButton />
    </View>
  );

  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: 'hsl(var(--background))',
          borderBottomWidth: 0,
          elevation: 0,
          height: 56, // Reduced header height
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 20,
        },
        // Use DrawerToggleButton for the right side on mobile
        headerRight: Platform.select({
          native: () => (
            <View className="mr-2 h-full items-center justify-center">
              <DrawerToggleButton />
            </View>
          ),
          web: undefined, // Web often uses a persistent sidebar
        }),
        // Move cart/search to the left
        headerLeft: Platform.select({
          native: headerLeft,
          web: undefined,
        }),
      }}>
      {/*  Tabs Group (Dashboard, Products, Orders, Messages, Analytics) */}
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Dashboard', // Default title for the tabs group
          drawerLabel: 'Dashboard',
          drawerIcon: ({ color, size }) => <Icon as={LayoutGrid} size={size} color={color} />,
        }}
      />

      <Drawer.Screen
        name="products"
        options={{
          title: 'Products',
          drawerLabel: 'Manage Products',
          drawerIcon: ({ color, size }) => <Icon as={Package} size={size} color={color} />,
        }}
      />

      <Drawer.Screen
        name="orders"
        options={{
          title: 'Orders',
          drawerLabel: 'Manage Orders',
          drawerIcon: ({ color, size }) => <Icon as={ShoppingCart} size={size} color={color} />,
        }}
      />

      <Drawer.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          drawerLabel: 'View Analytics',
          drawerIcon: ({ color, size }) => <Icon as={BarChart3} size={size} color={color} />,
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          title: 'Profile',
          drawerLabel: 'My Profile',
          drawerIcon: ({ color, size }) => <Icon as={User} size={size} color={color} />,
        }}
      />

      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          drawerLabel: 'Settings',
          drawerIcon: ({ color, size }) => <Icon as={Settings} size={size} color={color} />,
        }}
      />

      {/* Hidden screens that are part of the stack navigation */}
      <Drawer.Screen
        name="messages"
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
    </Drawer>
  );
}
