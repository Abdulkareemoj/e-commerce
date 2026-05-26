import React from 'react';
import { Icon } from '@/components/ui/icon';
import { Tabs } from 'expo-router';
import { LayoutGrid, Store, Wallet, BarChart3 } from 'lucide-react-native';

import { Platform } from 'react-native';

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

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'hsl(var(--primary))',
        tabBarInactiveTintColor: 'hsl(var(--muted-foreground))',
        tabBarStyle: {
          backgroundColor: 'hsl(var(--background))',
          borderTopWidth: 0,
          ...Platform.select({
            web: { height: 60, boxShadow: '0px -1px 4px rgba(0, 0, 0, 0.05)' },
            native: {
              height: 72,
              paddingBottom: 14,
              paddingTop: 6,
              shadowColor: 'transparent',
              shadowOpacity: 0,
              shadowRadius: 0,
              shadowOffset: { height: 0, width: 0 },
              elevation: 0,
            },
          }),
        },
        tabBarIconStyle: {
          ...Platform.select({ native: { paddingTop: 15, marginBottom: 5 }, web: { paddingTop: 4 } }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: Platform.select({ native: -6, web: 0 }),
          marginBottom: Platform.select({ native: 8, web: 0 }),
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
        name="vendors"
        options={{
          title: 'Vendors',
          tabBarIcon: ({ focused }) => <TabBarIcon name={Store} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="payouts"
        options={{
          title: 'Payouts',
          tabBarIcon: ({ focused }) => <TabBarIcon name={Wallet} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ focused }) => <TabBarIcon name={BarChart3} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
