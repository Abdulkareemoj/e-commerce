import { useRouter, Tabs, usePathname } from 'expo-router';
import { Text } from '@/components/ui/text';
import { View, TouchableOpacity, Pressable, useWindowDimensions } from 'react-native';
import { Menu, ShoppingBag, Home, Heart, Search, User, LayoutGrid } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from 'expo-router/react-navigation';
import { Icon } from '@/components/ui/icon';
import { useCart } from '@/hooks/useCart';

function TabHeader() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { totalItems } = useCart();

  return (
    <View
      style={{ paddingTop: insets.top + 4 }}
      className="bg-card flex-row items-center justify-between px-5 pb-3">
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        activeOpacity={0.7}
        className="bg-secondary size-10 items-center justify-center rounded-xl">
        <Icon as={Menu} size={20} className="text-foreground" />
      </TouchableOpacity>

      <Text className="text-foreground text-lg font-bold">Shop</Text>

      <View className="flex-row gap-2">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/search')}
          className="bg-secondary size-10 items-center justify-center rounded-xl">
          <Icon as={Search} size={20} className="text-foreground" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/cart')}
          className="bg-secondary size-10 items-center justify-center rounded-xl">
          <View>
            <Icon as={ShoppingBag} size={20} className="text-foreground" />
            {totalItems > 0 && (
              <View className="bg-primary absolute -top-1.5 -right-1.5 size-4 items-center justify-center rounded-full">
                <Text className="text-primary-foreground text-[9px] font-bold">
                  {totalItems > 99 ? '99+' : totalItems}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const TAB_ITEMS = [
  { name: 'home', icon: Home, label: 'Home' },
  { name: 'categories', icon: LayoutGrid, label: 'Categories' },
  { name: 'favorites', icon: Heart, label: 'Favorites' },
  { name: 'profile', icon: User, label: 'Profile' },
] as const;

function TabBarIcon({
  name,
  focused,
}: {
  name: (typeof TAB_ITEMS)[number]['icon'];
  focused: boolean;
}) {
  return (
    <Icon as={name} size={22} className={focused ? 'text-primary' : 'text-muted-foreground'} />
  );
}

function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const getCurrentTab = () => {
    const segment = pathname.split('/').filter(Boolean).pop() ?? '';
    return TAB_ITEMS.find((t) => t.name === segment)?.name ?? 'home';
  };

  const currentTab = getCurrentTab();

  return (
    <View
      style={{ paddingBottom: insets.bottom + 4 }}
      className="border-border bg-card border-t pt-2 pb-1">
      <View className="flex-row items-center justify-around px-2">
        {TAB_ITEMS.map((item) => {
          const focused = currentTab === item.name;
          return (
            <Pressable
              key={item.name}
              onPress={() => router.push(`/${item.name}`)}
              className="flex-1 items-center py-1">
              <View className="items-center gap-0.5">
                <TabBarIcon name={item.icon} focused={focused} />
                <Text
                  className={`text-[10px] ${
                    focused ? 'text-primary font-semibold' : 'text-muted-foreground font-medium'
                  }`}>
                  {item.label}
                </Text>
              </View>
              {focused && <View className="bg-primary absolute -top-0.5 h-0.5 w-5 rounded-full" />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const isWeb = width >= 1024;

  return (
    <Tabs
      tabBar={isWeb ? () => null : () => <CustomTabBar />}
      screenOptions={{
        header: isWeb ? () => null : () => <TabHeader />,
      }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="categories" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
