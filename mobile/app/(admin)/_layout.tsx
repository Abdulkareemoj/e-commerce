import { Drawer } from 'expo-router/drawer';
import { Text } from '@/components/ui/text';
import { View, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useRouter, usePathname, useNavigation } from 'expo-router';
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  BarChart3,
  LogOut,
  LayoutGrid,
  Menu,
  Wallet,
  Tags,
  Settings,
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
    { label: 'Dashboard', icon: LayoutGrid, route: '/(admin)/(tabs)' },
    { label: 'Users', icon: Users, route: '/(admin)/users' },
    { label: 'Vendors', icon: Store, route: '/(admin)/(tabs)/vendors' },
    { label: 'Products', icon: Package, route: '/(admin)/products' },
    { label: 'Orders', icon: ShoppingCart, route: '/(admin)/orders' },
    { label: 'Payouts', icon: Wallet, route: '/(admin)/(tabs)/payouts' },
    { label: 'Categories', icon: Tags, route: '/(admin)/categories' },
    { label: 'Analytics', icon: BarChart3, route: '/(admin)/(tabs)/analytics' },
    { label: 'Settings', icon: Settings, route: '/(admin)/settings' },
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
              {user.name?.charAt(0) ?? 'A'}
            </Text>
          ) : (
            <Text className="text-[22px] font-bold text-zinc-950">A</Text>
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
              Admin
            </Text>
            <Text numberOfLines={1} className="mt-0.5 text-[13px] text-zinc-500">
              admin@marketplace.com
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
          <DrawerHeader title={(options.title || options.drawerLabel || 'Admin') as string} />
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

      <Drawer.Screen
        name="users"
        options={{
          headerShown: true,
          drawerLabel: 'Users',
          title: 'Users',
        }}
      />

      <Drawer.Screen
        name="products"
        options={{
          headerShown: true,
          drawerLabel: 'Products',
          title: 'Products',
        }}
      />

      <Drawer.Screen
        name="orders"
        options={{
          headerShown: true,
          drawerLabel: 'Orders',
          title: 'Orders',
        }}
      />

      <Drawer.Screen
        name="categories"
        options={{
          headerShown: true,
          drawerLabel: 'Categories',
          title: 'Categories',
        }}
      />

      <Drawer.Screen
        name="settings"
        options={{
          headerShown: true,
          drawerLabel: 'Settings',
          title: 'Settings',
        }}
      />

      <Drawer.Screen
        name="vendors"
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
    </Drawer>
  );
}
