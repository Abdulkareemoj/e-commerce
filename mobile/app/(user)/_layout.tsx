import { Drawer } from 'expo-router/drawer';
import { Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import {
  Store,
  Receipt,
  Bell,
  Settings,
  LogOut,
  MessageSquare,
  LayoutGrid,
  ArrowLeft,
  Home,
  Heart,
  User,
  ShoppingBag,
} from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/authStore';
import { AppSidebar } from '@/components/layout/AppSidebar';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

function CustomDrawerContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  const navItems = [
    { label: 'Shop', icon: Home, route: '/(user)/(tabs)/home' },
    { label: 'Catalog', icon: LayoutGrid, route: '/(user)/(tabs)/categories' },
    { label: 'Favorites', icon: Heart, route: '/(user)/(tabs)/favorites' },
    { label: 'My Orders', icon: Receipt, route: '/(user)/orders' },
    { label: 'Messages', icon: MessageSquare, route: '/(user)/messages' },
    { label: 'Notifications', icon: Bell, route: '/(user)/notification' },
    { label: 'Settings', icon: Settings, route: '/(user)/settings' },
  ];

  const handleLogout = () => {
    clearAuth();
    router.replace('/(auth)/sign-in');
  };

  return (
    <ScrollView
      contentContainerStyle={{ flex: 1, paddingBottom: 20 }}
      className="bg-card"
      showsVerticalScrollIndicator={false}>
      <View className="border-border border-b px-5 pt-12 pb-5">
        <View className="bg-primary mb-3 size-14 items-center justify-center rounded-full">
          {user ? (
            <Text className="text-primary-foreground text-xl font-bold">
              {user.name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          ) : (
            <Text className="text-primary-foreground text-xl font-bold">G</Text>
          )}
        </View>

        {isAuthenticated && user ? (
          <>
            <Text numberOfLines={1} className="text-foreground text-lg font-bold">
              {user.name}
            </Text>
            <Text numberOfLines={1} className="text-muted-foreground mt-0.5 text-sm">
              {user.email}
            </Text>
          </>
        ) : (
          <Pressable onPress={() => router.push('/(auth)/sign-in')}>
            <Text numberOfLines={1} className="text-foreground text-lg font-bold">
              Sign In
            </Text>
            <Text numberOfLines={1} className="text-muted-foreground mt-0.5 text-sm">
              Tap to access your account
            </Text>
          </Pressable>
        )}
      </View>

      <View className="flex-1 px-3 pt-3">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.route.split('/').pop() || '');
          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route as any)}
              className={`mb-1 flex-row items-center gap-3 rounded-xl px-3 py-2.5 ${
                isActive ? 'bg-primary/10' : 'active:bg-secondary/50'
              }`}>
              <Icon
                as={item.icon}
                size={18}
                className={isActive ? 'text-primary' : 'text-muted-foreground'}
              />
              <Text
                className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="border-border border-t px-5 pt-4 pb-6">
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.7}
          className="active:bg-destructive/5 flex-row items-center gap-2.5 rounded-xl p-2">
          <Icon as={LogOut} size={18} className="text-destructive" />
          <Text className="text-destructive text-sm font-medium">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DrawerHeader({ title }: { title: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="border-border bg-card flex-row items-center border-b px-5 pb-3">
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        className="bg-secondary mr-3 size-10 items-center justify-center rounded-xl">
        <Icon as={ArrowLeft} size={18} className="text-foreground" />
      </TouchableOpacity>
      <Text numberOfLines={1} className="text-foreground text-lg font-bold">
        {title}
      </Text>
    </View>
  );
}

function MobileLayout() {
  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: true,
        header: ({ options }) => (
          <DrawerHeader title={(options.title || options.drawerLabel || 'Untitled') as string} />
        ),
        drawerStyle: { backgroundColor: 'hsl(0 0% 100%)', width: 280 },
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.4)',
        swipeEdgeWidth: 50,
        sceneStyle: { backgroundColor: 'hsl(240 5% 96%)' },
      }}>
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          drawerLabel: 'Shop',
          title: 'Shop',
        }}
      />

      <Drawer.Screen
        name="catalog"
        options={{
          headerShown: true,
          drawerLabel: 'Catalog',
          title: 'All Products',
        }}
      />

      <Drawer.Screen
        name="messages"
        options={{
          headerShown: true,
          drawerLabel: 'Messages',
          title: 'Inbox',
        }}
      />

      <Drawer.Screen
        name="orders"
        options={{
          headerShown: true,
          drawerLabel: 'My Orders',
          title: 'Order History',
        }}
      />

      <Drawer.Screen
        name="notification"
        options={{
          headerShown: true,
          drawerLabel: 'Notifications',
          title: 'Alerts',
        }}
      />

      <Drawer.Screen
        name="settings"
        options={{
          headerShown: true,
          drawerLabel: 'Settings',
          title: 'Preferences',
        }}
      />

      <Drawer.Screen
        name="search"
        options={{
          headerShown: true,
          drawerLabel: 'Search',
          title: 'Find Products',
        }}
      />

      <Drawer.Screen
        name="product/[id]"
        options={{
          headerShown: true,
          drawerLabel: 'Product',
          title: 'Details',
        }}
      />

      <Drawer.Screen
        name="cart"
        options={{
          headerShown: true,
          drawerLabel: 'Cart',
          title: 'My Shopping Bag',
        }}
      />
    </Drawer>
  );
}

function WebLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="catalog" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="notification" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="search" />
      <Stack.Screen name="product/[id]" />
      <Stack.Screen name="cart" />
    </Stack>
  );
}

export default function UserLayout() {
  const { width } = useWindowDimensions();
  const isWeb = width >= 1024;

  if (isWeb) {
    return (
      <View className="bg-background flex-1 flex-row">
        <AppSidebar role="user" />
        <View className="flex-1">
          <WebLayout />
        </View>
      </View>
    );
  }

  return <MobileLayout />;
}
