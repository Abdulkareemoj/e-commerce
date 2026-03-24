import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import {
  Store,
  Receipt,
  Heart,
  MapPin,
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

// ─── Custom Drawer Content ────────────────────────────────────────────────────
function CustomDrawerContent(props: any) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: 'Catalog', icon: LayoutGrid, route: '/(user)/(tabs)/categories' },
    { label: 'My Orders', icon: Receipt, route: '/(user)/orders' },
    { label: 'Messages', icon: MessageSquare, route: '/(user)/messages' },
    { label: 'Notifications', icon: Bell, route: '/(user)/notification' },
    { label: 'Settings', icon: Settings, route: '/(user)/settings' },
  ] as const;

  return (
    <DrawerContentScrollView
      {...props}
      scrollEnabled={false}
      className="bg-zinc-950"
      contentContainerStyle={{ flex: 1 }}>
      {/* ── Profile Header ── */}
      <View className="px-5 pt-9 pb-5 border-zinc-900">
        {/* Avatar */}
        <View className="w-[60px] h-[60px] rounded-full bg-amber-400 items-center justify-center mb-3">
          <Text className="text-zinc-950 text-[22px] font-bold">JD</Text>
        </View>

        <Text numberOfLines={1} className="text-white text-[17px] font-semibold tracking-tight">
          Jane Doe
        </Text>
        <Text numberOfLines={1} className="text-zinc-500 text-[13px] mt-0.5">jane@example.com</Text>

        {/* Gold badge */}
        <View className="mt-2.5 self-start flex-row items-center gap-1.5 bg-amber-400/10 px-2.5 py-1 rounded-full">
          <Icon as={Star} size={11} className="text-amber-400" />
          <Text className="text-amber-400 text-[11px] font-semibold">Gold Member</Text>
        </View>
      </View>
 <Separator className="my-4" />
      {/* ── Nav Items ── */}
      <View className="flex-1 pt-2 px-2">
        <DrawerItem
          label="Shop"
          icon={({ size }) => (
            <Icon
              as={Store}
              size={size}
              className={pathname === '/home' || pathname === '/' ? 'text-amber-400' : 'text-zinc-500'}
            />
          )}
          onPress={() => router.push('/(user)/(tabs)/home')}
          labelStyle={{
            color: pathname === '/home' || pathname === '/' ? '#fbbf24' : '#d4d4d8',
            fontWeight: pathname === '/home' || pathname === '/' ? '600' : '400',
            fontSize: 14,
            marginLeft: 8,
          }}
          style={{
            borderRadius: 10,
            backgroundColor: (pathname === '/home' || pathname === '/') ? 'rgba(251,191,36,0.08)' : 'transparent',
            marginBottom: 2,
          }}
        />

        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.route.replace('/(user)', ''));
          return (
            <DrawerItem
              key={item.route}
              label={item.label}
              icon={({ size }) => (
                <Icon
                  as={item.icon}
                  size={size}
                  className={isActive ? 'text-amber-400' : 'text-zinc-500'}
                />
              )}
              onPress={() => router.push(item.route )}
              labelStyle={{
                color: isActive ? '#fbbf24' : '#d4d4d8',
                fontWeight: isActive ? '600' : '400',
                fontSize: 14,
                marginLeft: 12,
              }}
              style={{
                borderRadius: 10,
                backgroundColor: isActive ? 'rgba(251,191,36,0.08)' : 'transparent',
                marginBottom: 2,
              }}
            />
          );
        })}
      </View>

      {/* ── Sign Out ── */}
      <View className="px-5 pb-9 pt-4 border-t border-zinc-900">
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/sign-in')}
          activeOpacity={0.7}
          className="flex-row items-center gap-2.5">
          <Icon as={LogOut} size={19} className="text-red-500" />
          <Text className="text-red-400 text-sm font-medium">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

// ─── Drawer Header Component ──────────────────────────────────────────────
function DrawerHeader({ title }: { title: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="bg-zinc-950 border-b border-zinc-900 pb-3 flex-row items-center px-4">
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        className="w-10 h-10 rounded-xl bg-zinc-900 items-center justify-center mr-3">
        <Icon as={ArrowLeft} size={20} className="text-zinc-200" />
      </TouchableOpacity>
      <Text numberOfLines={1} className="text-white text-lg font-bold tracking-tight">
        {title}
      </Text>
    </View>
  );
}

// ─── Root Drawer Layout ───────────────────────────────────────────────────────
export default function UserLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
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
