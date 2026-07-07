import React from 'react';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Tabs, usePathname } from 'expo-router';
import {
  LayoutGrid,
  Package,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  AlertTriangle,
} from 'lucide-react-native';
import { View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  orders: 'Orders',
  inventory: 'Inventory',
  messages: 'Messages',
  analytics: 'Analytics',
  profile: 'Profile',
  settings: 'Settings',
};

function WebHeader() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const segment = pathname.split('/').filter(Boolean).pop() ?? 'dashboard';
  const title = TAB_TITLES[segment] || 'Vendor';

  return (
    <View
      style={{ paddingTop: insets.top + 12 }}
      className="border-border bg-card items-center justify-center border-b px-6 pb-3">
      <Text className="text-foreground text-lg font-bold">{title}</Text>
    </View>
  );
}

function TabBarIcon({
  name,
  focused,
}: {
  name: React.ComponentProps<typeof Icon>['as'];
  focused: boolean;
}) {
  return (
    <View className="items-center justify-center">
      <Icon as={name} size={22} className={focused ? 'text-primary' : 'text-muted-foreground'} />
      {focused && <View className="bg-primary mt-1 h-1 w-1 rounded-full" />}
    </View>
  );
}

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const isWeb = width >= 1024;

  return (
    <Tabs
      screenOptions={{
        headerShown: isWeb,
        header: () => <WebHeader />,
        tabBarActiveTintColor: 'hsl(var(--primary))',
        tabBarInactiveTintColor: 'hsl(var(--muted-foreground))',
        tabBarStyle: isWeb
          ? { display: 'none' }
          : {
              backgroundColor: 'hsl(0 0% 100%)',
              borderTopWidth: 0,
              height: 70,
              paddingBottom: 12,
              paddingTop: 8,
              shadowColor: 'transparent',
              shadowOpacity: 0,
              shadowRadius: 0,
              shadowOffset: { height: 0, width: 0 },
              elevation: 0,
            },
        tabBarIconStyle: {
          paddingTop: 8,
          marginBottom: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -4,
          marginBottom: 4,
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabBarIcon name={LayoutGrid} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ focused }) => <TabBarIcon name={Package} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => <TabBarIcon name={ShoppingCart} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ focused }) => <TabBarIcon name={AlertTriangle} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ focused }) => <TabBarIcon name={MessageSquare} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
