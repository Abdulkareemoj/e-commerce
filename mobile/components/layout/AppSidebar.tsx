import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { View, Pressable, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import {
  Home,
  LayoutGrid,
  Heart,
  User,
  ShoppingBag,
  Package,
  MessageSquare,
  Settings,
  LogOut,
  Store,
  BarChart3,
  Users,
  Wallet,
  Tag,
  Flag,
  LogIn,
} from 'lucide-react-native';
import { useAuthStore } from '@/lib/authStore';
import { useCart } from '@/hooks/useCart';

interface NavItem {
  label: string;
  icon: any;
  href: string;
  badge?: number;
}

interface AppSidebarProps {
  role?: 'user' | 'vendor' | 'admin';
}

const USER_NAV: NavItem[] = [
  { label: 'Home', icon: Home, href: '/(user)/(tabs)/home' },
  { label: 'Catalog', icon: LayoutGrid, href: '/(user)/(tabs)/categories' },
  { label: 'Favorites', icon: Heart, href: '/(user)/(tabs)/favorites' },
  { label: 'Orders', icon: Package, href: '/(user)/orders' },
  { label: 'Messages', icon: MessageSquare, href: '/(user)/messages' },
  { label: 'Profile', icon: User, href: '/(user)/(tabs)/profile' },
  { label: 'Settings', icon: Settings, href: '/(user)/settings' },
];

const VENDOR_NAV: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/(vendor)/(tabs)/dashboard' },
  { label: 'Products', icon: Package, href: '/(vendor)/(tabs)/products' },
  { label: 'Orders', icon: ShoppingBag, href: '/(vendor)/(tabs)/orders' },
  { label: 'Inventory', icon: LayoutGrid, href: '/(vendor)/(tabs)/inventory' },
  { label: 'Messages', icon: MessageSquare, href: '/(vendor)/(tabs)/messages' },
  { label: 'Analytics', icon: BarChart3, href: '/(vendor)/analytics' },
  { label: 'Profile', icon: User, href: '/(vendor)/profile' },
  { label: 'Settings', icon: Settings, href: '/(vendor)/settings' },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/(admin)/(tabs)/dashboard' },
  { label: 'Vendors', icon: Store, href: '/(admin)/(tabs)/vendors' },
  { label: 'Users', icon: Users, href: '/(admin)/users' },
  { label: 'Products', icon: Package, href: '/(admin)/products' },
  { label: 'Coupons', icon: Tag, href: '/(admin)/coupons' },
  { label: 'Orders', icon: ShoppingBag, href: '/(admin)/orders' },
  { label: 'Payouts', icon: Wallet, href: '/(admin)/(tabs)/payouts' },
  { label: 'Categories', icon: LayoutGrid, href: '/(admin)/categories' },
  { label: 'Reports', icon: Flag, href: '/(admin)/reports' },
  { label: 'Analytics', icon: BarChart3, href: '/(admin)/(tabs)/analytics' },
  { label: 'Settings', icon: Settings, href: '/(admin)/settings' },
];

export function AppSidebar({ role = 'user' }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { totalItems } = useCart();

  const navItems = role === 'admin' ? ADMIN_NAV : role === 'vendor' ? VENDOR_NAV : USER_NAV;

  const isActive = (href: string) => {
    return pathname.includes(href.split('/').pop() || '');
  };

  return (
    <View className="border-border bg-card hidden w-64 flex-col border-r lg:flex">
      <View className="flex-1 p-4">
        <View className="mb-6 flex-row items-center gap-2 px-2">
          <View className="bg-primary size-8 items-center justify-center rounded-lg">
            <Text className="text-primary-foreground text-sm font-bold">M</Text>
          </View>
          <Text className="text-foreground text-lg font-bold">Marketplace</Text>
        </View>

        <View className="flex-1 gap-1">
          {navItems.map((item) => {
            const focused = isActive(item.href);
            return (
              <Pressable
                key={item.label}
                onPress={() => router.push(item.href as any)}
                className={`flex-row items-center gap-3 rounded-xl px-3 py-2.5 ${
                  focused ? 'bg-primary/10' : 'active:bg-secondary/50'
                }`}>
                <Icon
                  as={item.icon}
                  size={18}
                  className={focused ? 'text-primary' : 'text-muted-foreground'}
                />
                <Text
                  className={`text-sm font-medium ${focused ? 'text-primary' : 'text-foreground'}`}>
                  {item.label}
                </Text>
                {item.badge && item.badge > 0 && (
                  <View className="bg-primary ml-auto size-5 items-center justify-center rounded-full">
                    <Text className="text-primary-foreground text-[10px] font-bold">
                      {item.badge > 99 ? '99+' : item.badge}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

           <View className="border-border border-t p-4">
        {isAuthenticated && user ? (
          <View className="flex-row items-center gap-3">
            <Avatar alt={user.name || 'User'} className="size-9">
              <AvatarFallback className="bg-primary">
                <Text className="text-primary-foreground text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </AvatarFallback>
            </Avatar>
            <View className="flex-1">
              <Text className="text-foreground text-sm font-medium" numberOfLines={1}>
                {user.name}
              </Text>
              <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                {user.email}
              </Text>
            </View>
            <Pressable
              onPress={() => clearAuth()}
              className="active:bg-secondary/50 size-8 items-center justify-center rounded-lg">
              <Icon as={LogOut} size={16} className="text-muted-foreground" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => router.push('/(auth)/sign-in')}
            className="active:bg-secondary/50 flex-row items-center gap-3 rounded-lg p-1">
            <View className="bg-muted size-9 items-center justify-center rounded-full">
              <Icon as={LogIn} size={16} className="text-muted-foreground" />
            </View>
            <View className="flex-1">
              <Text className="text-foreground text-sm font-medium">Sign In</Text>
              <Text className="text-muted-foreground text-xs">Tap to access your account</Text>
            </View>
          </Pressable>
        )}
      </View>
    </View>

  
  );
}
