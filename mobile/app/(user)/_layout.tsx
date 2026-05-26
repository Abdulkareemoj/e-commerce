import { Drawer } from 'expo-router/drawer';
import { Text } from '@/components/ui/text';
import { View, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import {
  Store,
  Receipt,
  Bell,
  Settings,
  Star,
  LogOut,
  MessageSquare,
  LayoutGrid,
  ArrowLeft,
} from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/authStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// ─── Custom Drawer Content ────────────────────────────────────────────────────
function CustomDrawerContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  const navItems = [
    { label: 'Catalog', icon: LayoutGrid, route: '/(user)/(tabs)/categories' },
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
      className="bg-zinc-950"
      showsVerticalScrollIndicator={false}>
      {/* ── Profile Header ── */}
      <View className="border-zinc-900 px-5 pt-9 pb-5">
        {/* Avatar */}
        <View className="mb-3 h-[60px] w-[60px] items-center justify-center rounded-full bg-amber-400">
          {user ? (
            <Text className="text-[22px] font-bold text-zinc-950">
              {user.name?.charAt(0) ?? '?'}
            </Text>
          ) : (
            <Text className="text-[22px] font-bold text-zinc-950">JD</Text>
          )}
        </View>

        {isAuthenticated && user ? (
          <>
            <Text numberOfLines={1} className="text-[17px] font-semibold tracking-tight text-white">
              {user.name}
            </Text>
            <Text numberOfLines={1} className="mt-0.5 text-[13px] text-zinc-500">
              {user.email}
            </Text>
          </>
        ) : (
          <>
            <Text numberOfLines={1} className="text-[17px] font-semibold tracking-tight text-white">
              Jane Doe
            </Text>
            <Text numberOfLines={1} className="mt-0.5 text-[13px] text-zinc-500">
              jane@example.com
            </Text>
          </>
        )}

        {/* Gold badge */}
        <View className="mt-2.5 flex-row items-center gap-1.5 self-start rounded-full bg-amber-400/10 px-2.5 py-1">
          <Icon as={Star} size={11} className="text-amber-400" />
          <Text className="text-[11px] font-semibold text-amber-400">Gold Member</Text>
        </View>
      </View>
      <Separator className="my-4" />
      {/* ── Nav Items ── */}
      <View className="flex-1 px-2 pt-2">
        <Pressable
          onPress={() => router.push('/(user)/(tabs)/home')}
          className={`flex-row items-center gap-3 px-4 py-2 ${pathname === '/home' || pathname === '/' ? 'bg-amber-400/10' : ''} rounded`}>
          <Icon
            as={Store}
            size={20}
            className={
              pathname === '/home' || pathname === '/' ? 'text-amber-400' : 'text-zinc-500'
            }
          />
          <Text className="text-base font-medium">
            {pathname === '/home' || pathname === '/' ? 'Shop' : 'Shop'}
          </Text>
        </Pressable>

        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.route);
          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route)}
              className={`flex-row items-center gap-3 px-4 py-2 ${isActive ? 'bg-amber-400/10' : ''} rounded`}>
              <Icon
                as={item.icon}
                size={20}
                className={isActive ? 'text-amber-400' : 'text-zinc-500'}
              />
              <Text className="text-base font-medium">{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Sign Out ── */}
      <View className="border-t border-zinc-900 px-5 pt-4 pb-9">
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.7}
          className="flex-row items-center gap-2.5">
          <Icon as={LogOut} size={19} className="text-red-500" />
          <Text className="text-sm font-medium text-red-400">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Drawer Header Component ──────────────────────────────────────────────
function DrawerHeader({ title }: { title: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="flex-row items-center border-b border-zinc-900 bg-zinc-950 px-4 pb-3">
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-zinc-900">
        <Icon as={ArrowLeft} size={20} className="text-zinc-200" />
      </TouchableOpacity>
      <Text numberOfLines={1} className="text-lg font-bold tracking-tight text-white">
        {title}
      </Text>
    </View>
  );
}

// ─── Root Drawer Layout ───────────────────────────────────────────────────────
export default function UserLayout() {
  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: true,
        header: ({ options }) => (
          <DrawerHeader title={(options.title || options.drawerLabel || 'Untitled') as string} />
        ),
        drawerStyle: { backgroundColor: '#09090b', width: 285 },
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.55)',
        swipeEdgeWidth: 50,
        sceneStyle: { backgroundColor: '#09090b' },
      }}>
      {/* Tabs are the main shell - No header here as Tabs has its own */}
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
