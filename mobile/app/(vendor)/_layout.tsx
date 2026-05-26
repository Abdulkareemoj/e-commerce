import { Drawer } from 'expo-router/drawer';
import { Text } from '@/components/ui/text';
import { View, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useRouter, usePathname, useNavigation } from 'expo-router';
import {
  ShoppingCart,
  User,
  Settings,
  LayoutGrid,
  LogOut,
  Package,
  BarChart3,
  Menu,
  MessageSquare,
} from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/authStore';

export { ErrorBoundary } from 'expo-router';

function CustomDrawerContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', icon: LayoutGrid, route: '/(vendor)/(tabs)' },
    { label: 'Products', icon: Package, route: '/(vendor)/(tabs)/products' },
    { label: 'Orders', icon: ShoppingCart, route: '/(vendor)/(tabs)/orders' },
    { label: 'Messages', icon: MessageSquare, route: '/(vendor)/(tabs)/messages' },
    { label: 'Analytics', icon: BarChart3, route: '/(vendor)/(tabs)/analytics' },
    { label: 'Profile', icon: User, route: '/(vendor)/(tabs)/profile' },
    { label: 'Settings', icon: Settings, route: '/(vendor)/(tabs)/settings' },
    { label: 'Inventory', icon: Package, route: '/(vendor)/(tabs)/inventory' },
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
      <View className="border-zinc-900 px-5 pt-9 pb-5">
        <View className="mb-3 h-[60px] w-[60px] items-center justify-center rounded-full bg-amber-400">
          {user ? (
            <Text className="text-[22px] font-bold text-zinc-950">
              {user.name?.charAt(0) ?? 'V'}
            </Text>
          ) : (
            <Text className="text-[22px] font-bold text-zinc-950">V</Text>
          )}
        </View>

        {user ? (
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
              Vendor
            </Text>
            <Text numberOfLines={1} className="mt-0.5 text-[13px] text-zinc-500">
              vendor@marketplace.com
            </Text>
          </>
        )}
      </View>
      <Separator className="my-4" />

      <View className="flex-1 px-2 pt-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.route) || pathname === item.route;
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

function DrawerHeader({ title }: { title: string }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="flex-row items-center border-b border-zinc-900 bg-zinc-950 px-4 pb-3">
      <TouchableOpacity
        onPress={() => (navigation as any).toggleDrawer()}
        activeOpacity={0.7}
        className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-zinc-900">
        <Icon as={Menu} size={20} className="text-zinc-200" />
      </TouchableOpacity>
      <Text numberOfLines={1} className="text-lg font-bold tracking-tight text-white">
        {title}
      </Text>
    </View>
  );
}

export default function AppLayout() {
  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: true,
        header: ({ options }) => (
          <DrawerHeader title={(options.title || options.drawerLabel || 'Vendor') as string} />
        ),
        drawerStyle: { backgroundColor: '#09090b', width: 285 },
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.55)',
        swipeEdgeWidth: 50,
        sceneStyle: { backgroundColor: '#09090b' },
      }}>
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          drawerLabel: 'Dashboard',
          title: 'Dashboard',
        }}
      />
      <Drawer.Screen name="products" options={{ headerShown: true, title: 'My Products' }} />
      <Drawer.Screen name="orders" options={{ headerShown: true, title: 'Orders' }} />
      <Drawer.Screen name="inventory" options={{ headerShown: true, title: 'Inventory' }} />
      <Drawer.Screen name="analytics" options={{ headerShown: true, title: 'Analytics' }} />
      <Drawer.Screen name="profile" options={{ headerShown: true, title: 'Profile' }} />
      <Drawer.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
      <Drawer.Screen
        name="pending"
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
      <Drawer.Screen
        name="rejected"
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
      <Drawer.Screen
        name="messages"
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
    </Drawer>
  );
}
