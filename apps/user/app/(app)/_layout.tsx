import { Icon } from '@/components/ui/icon';
import { Tabs } from 'expo-router';
import { Home, Search, ShoppingCart, Heart, User, MessageSquare } from 'lucide-react-native';
import React from 'react';
import { Platform } from 'react-native';

// Helper component for Tab Bar Icons
function TabBarIcon({
  name,
  focused,
}: {
  name: React.ComponentProps<typeof Icon>['as'];
  focused: boolean;
}) {
  const colorClass = focused ? 'text-primary' : 'text-muted-foreground';
  return <Icon as={name} size={24} className={colorClass} />;
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true, // Show header by default for consistency
        headerStyle: {
          backgroundColor: 'hsl(var(--background))',
          borderBottomWidth: 0,
          elevation: 0,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 20,
        },
        tabBarActiveTintColor: 'hsl(var(--primary))',
        tabBarInactiveTintColor: 'hsl(var(--muted-foreground))',
        tabBarStyle: {
          backgroundColor: 'hsl(var(--background))',
          borderTopWidth: 0,
          ...Platform.select({
            web: {
              height: 60,
              boxShadow: '0px -1px 4px rgba(0, 0, 0, 0.05)',
            },
            native: {
              height: 80,
              paddingBottom: 20,
              shadowColor: 'black',
              shadowOpacity: 0.1,
              shadowRadius: 20,
              paddingTop: 10,
              shadowOffset: {
                height: -3,
                width: 0,
              },
              elevation: 24,
            },
          }),
        },
        tabBarIconStyle: {
          ...Platform.select({
            native: {
              paddingTop: 10,
            },
            web: {
              paddingTop: 4,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: Platform.select({ native: 4, web: 0 }),
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Discover',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabBarIcon name={Home} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Catalog',
          tabBarIcon: ({ focused }) => <TabBarIcon name={Search} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => <TabBarIcon name={ShoppingCart} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ focused }) => <TabBarIcon name={Heart} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabBarIcon name={User} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ focused }) => <TabBarIcon name={MessageSquare} focused={focused} />,
        }}
      />

      {/* Hidden screens that are part of the stack nSavigation within tabs */}
      <Tabs.Screen name="product/[id]" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="orders" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="addresses" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="checkout" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="search" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="settings" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="support" options={{ href: null, headerShown: false }} />

      {/* Hidden nested routes */}
      <Tabs.Screen name="catalog/filters" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="settings/privacy" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="settings/terms" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}
