import { Drawer } from 'expo-router/drawer';
import { Text } from '@/components/ui/text';
import { View, TouchableOpacity, ScrollView, Pressable, useWindowDimensions } from 'react-native';
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
  Tag,
  Flag,
} from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/authStore';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AuthGuard } from '@/components/AuthGuard';

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
    { label: 'Coupons', icon: Tag, route: '/(admin)/coupons' },
    { label: 'Payouts', icon: Wallet, route: '/(admin)/(tabs)/payouts' },
    { label: 'Categories', icon: Tags, route: '/(admin)/categories' },
    { label: 'Reports', icon: Flag, route: '/(admin)/reports' },
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
      className="bg-card"
      showsVerticalScrollIndicator={false}>
      <View className="border-border border-b px-5 pt-12 pb-5">
        <View className="bg-primary mb-3 size-14 items-center justify-center rounded-full">
          {user ? (
            <Text className="text-primary-foreground text-xl font-bold">
              {user.name?.charAt(0).toUpperCase() ?? 'A'}
            </Text>
          ) : (
            <Text className="text-primary-foreground text-xl font-bold">A</Text>
          )}
        </View>

        {user ? (
          <>
            <Text numberOfLines={1} className="text-foreground text-lg font-bold">
              {user.name}
            </Text>
            <Text numberOfLines={1} className="text-muted-foreground mt-0.5 text-sm">
              {user.email}
            </Text>
            <View className="mt-2 flex-row items-center gap-2">
              <View className="bg-destructive/10 items-center justify-center rounded-full px-3 py-1">
                <Text className="text-destructive text-xs font-semibold">Admin</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <Text numberOfLines={1} className="text-foreground text-lg font-bold">
              Admin
            </Text>
            <Text numberOfLines={1} className="text-muted-foreground mt-0.5 text-sm">
              admin@marketplace.com
            </Text>
          </>
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
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="border-border bg-card flex-row items-center border-b px-5 pb-3">
      <TouchableOpacity
        onPress={() => (navigation as any).toggleDrawer()}
        activeOpacity={0.7}
        className="bg-secondary mr-3 size-10 items-center justify-center rounded-xl">
        <Icon as={Menu} size={18} className="text-foreground" />
      </TouchableOpacity>
      <Text numberOfLines={1} className="text-foreground text-lg font-bold">
        {title}
      </Text>
    </View>
  );
}

import { Stack } from 'expo-router';

function MobileLayout() {
  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: true,
        header: ({ options }) => (
          <DrawerHeader title={(options.title || options.drawerLabel || 'Admin') as string} />
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
          drawerLabel: 'Dashboard',
          title: 'Dashboard',
        }}
      />
      <Drawer.Screen name="users" options={{ headerShown: true, title: 'Users' }} />
      <Drawer.Screen name="coupons" options={{ headerShown: true, title: 'Coupons' }} />
      <Drawer.Screen name="products" options={{ headerShown: true, title: 'Products' }} />
      <Drawer.Screen name="orders" options={{ headerShown: true, title: 'Orders' }} />
      <Drawer.Screen name="categories" options={{ headerShown: true, title: 'Categories' }} />
      <Drawer.Screen name="reports" options={{ headerShown: true, title: 'Reports' }} />
      <Drawer.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
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
      <Stack.Screen name="users" />
      <Stack.Screen name="coupons" />
      <Stack.Screen name="products" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

export default function AdminLayout() {
  const { width } = useWindowDimensions();
  const isWeb = width >= 1024;

  return (
    <AuthGuard requiredRole="admin" roleMessage="You need an admin account to access this page.">
      {isWeb ? (
        <View className="bg-background flex-1 flex-row">
          <AppSidebar role="admin" />
          <View className="flex-1">
            <WebLayout />
          </View>
        </View>
      ) : (
        <MobileLayout />
      )}
    </AuthGuard>
  );
}
