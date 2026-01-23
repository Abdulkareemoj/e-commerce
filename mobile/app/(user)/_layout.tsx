import { Icon } from '@/components/ui/icon';
import Drawer from 'expo-router/drawer';
import { ShoppingCart, Search, User, Settings, LayoutGrid, LogOut } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  DrawerToggleButton,
} from '@react-navigation/drawer';
import { Text } from '@/components/ui/text';
import { Link, usePathname, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authClient } from '@/lib/auth-client';

// Placeholder for Cart Button
function CartButton() {
  return (
    <Link href="/(app)/(tabs)/cart" asChild>
      <Pressable className="p-2">
        <Icon as={ShoppingCart} size={24} className="text-foreground" />
      </Pressable>
    </Link>
  );
}

// Placeholder for Search Button
function SearchButton() {
  return (
    <Link href="/(app)/search" asChild>
      <Pressable className="p-2">
        <Icon as={Search} size={24} className="text-foreground" />
      </Pressable>
    </Link>
  );
}

// Custom Drawer Content

function CustomDrawerContent(props: any) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
      {/* User Profile Summary */}
      <View
        style={{ paddingTop: insets.top }}
        className="border-b border-border bg-secondary/50 p-4">
        {session?.user ? (
          <>
            <Text variant="h3" className="py-4 font-bold">
              {session.user.name}
            </Text>
            <Text className="text-sm text-muted-foreground">{session.user.email}</Text>
          </>
        ) : (
          <Text className="py-4 font-bold">Guest User</Text>
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

// Main Layout

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
          height: 56,
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
      {/*  Tabs Group (Home, Cart, Favorites, Messages) */}
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Home',
          drawerLabel: 'Home',
          drawerIcon: ({ color, size }) => <Icon as={LayoutGrid} size={size} color={color} />,
        }}
      />

      <Drawer.Screen
        name="catalog"
        options={{
          title: 'Catalog',
          drawerLabel: 'Shop Catalog',
          drawerIcon: ({ color, size }) => <Icon as={Search} size={size} color={color} />,
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
        name="product/[id]"
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
      <Drawer.Screen
        name="orders"
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
      <Drawer.Screen
        name="checkout"
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
      <Drawer.Screen
        name="search"
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
    </Drawer>
  );
}
