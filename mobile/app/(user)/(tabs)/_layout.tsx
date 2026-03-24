import { useRouter, Tabs, usePathname } from 'expo-router';
import { View, Text, TouchableOpacity, Animated, Pressable } from 'react-native';
import { Menu, ShoppingBag, Home, Heart, Search, User, ListCollapse } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Icon } from '@/components/ui/icon';
import { useRef, useEffect } from 'react';

// ─── Custom Header ────────────────────────────────────────────────────
function TabHeader({ title }: { title: string }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View
      style={{ paddingTop: insets.top + 2 }}
      className="relative pb-3.5 px-5 bg-zinc-950 border-b border-zinc-900 flex-row items-center justify-between">
      <View
        className="absolute left-0 right-0 items-center justify-center"
        style={{ top: insets.top + 2, bottom: 14 }}
        pointerEvents="none">
        <Text className="text-white text-[17px] font-bold tracking-tight">
          {title}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        activeOpacity={0.7}
        className="w-10 h-10 rounded-xl bg-zinc-900 items-center justify-center">
        <Icon as={Menu} size={20} className="text-zinc-200" />
      </TouchableOpacity>

      <View className="flex flex-row gap-2">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/cart')}
          className="w-10 h-10 rounded-xl bg-zinc-900 items-center justify-center">
          <View>
            <Icon as={ShoppingBag} size={20} className="text-zinc-200" />
            <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 items-center justify-center">
              <Text className="text-zinc-950 text-[9px] font-bold">3</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/search')}
          className="w-10 h-10 rounded-xl bg-zinc-900 items-center justify-center">
          <Icon as={Search} size={20} className="text-zinc-200" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Animated Tab Item ────────────────────────────────────────────────
const TAB_ITEMS = [
  { name: 'home', icon: Home, label: 'Home' },
  { name: 'categories', icon: ListCollapse, label: 'Categories' },
  { name: 'favorites', icon: Heart, label: 'Favorites' },
  { name: 'profile', icon: User, label: 'Profile' },
] as const;

function AnimatedTabItem({
  item,
  focused,
  onPress,
}: {
  item: (typeof TAB_ITEMS)[number];
  focused: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pillOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const pillScale = useRef(new Animated.Value(focused ? 1 : 0.7)).current;
  const labelOpacity = useRef(new Animated.Value(focused ? 1 : 0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(pillOpacity, {
        toValue: focused ? 1 : 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.spring(pillScale, {
        toValue: focused ? 1 : 0.7,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(labelOpacity, {
        toValue: focused ? 1 : 0.45,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.88,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  const iconColor = focused ? '#fbbf24' : '#71717a'; // amber-400 : zinc-500

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ flex: 1, alignItems: 'center' }}>
      <Animated.View style={{ alignItems: 'center', gap: 4, transform: [{ scale }] }}>
        {/* Icon + pill */}
        <View style={{ width: 44, height: 28, alignItems: 'center', justifyContent: 'center' }}>
          {/* Animated pill background */}
          <Animated.View
            style={{
              position: 'absolute',
              width: 44,
              height: 28,
              borderRadius: 14,
              backgroundColor: 'rgba(251,191,36,0.15)',
              opacity: pillOpacity,
              transform: [{ scaleX: pillScale }],
            }}
          />
          <Icon as={item.icon} size={20} color={iconColor} />
        </View>

        {/* Label */}
        <Animated.Text
          style={{
            opacity: labelOpacity,
            fontSize: 12,
            fontWeight: focused ? '600' : '400',
            color: focused ? '#fbbf24' : '#71717a',
            letterSpacing: -0.2,
          }}>
          {item.label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────
function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const getCurrentTab = () => {
    const segment = pathname.split('/').pop() ?? '';
    return TAB_ITEMS.find((t) => t.name === segment)?.name ?? 'home';
  };

  const currentTab = getCurrentTab();

  return (
    <View
      style={{
        backgroundColor: '#09090b',
        borderTopWidth: 1,
        borderTopColor: '#18181b',
        paddingBottom: insets.bottom + 8,
        paddingTop: 10,
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      {TAB_ITEMS.map((item) => (
        <AnimatedTabItem
          key={item.name}
          item={item}
          focused={currentTab === item.name}
          onPress={() => router.push(`/${item.name}` )}
        />
      ))}
    </View>
  );
}

// ─── Tabs Layout ──────────────────────────────────────────────────────
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => <CustomTabBar />}
      screenOptions={({ route }) => ({
        header: () => <TabHeader title={getTitleForRoute(route.name)} />,
      })}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="categories" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

function getTitleForRoute(routeName: string): string {
  const map: Record<string, string> = {
    home: '🛍 Shop',
    categories: 'Categories',
    favorites: 'Favorites',
    profile: 'Profile',
  };
  return map[routeName] ?? 'Shop';
}