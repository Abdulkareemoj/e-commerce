import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  User,
  MapPin,
  Settings,
  Heart,
  Package,
  MessageSquare,
  LifeBuoy,
  LogOut,
} from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

// Mock User Data
const MOCK_USER = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  initials: 'JD',
};

// Navigation Links
const ACCOUNT_LINKS = [
  { name: 'Orders', icon: Package, href: '/(app)/orders' },
  { name: 'Favorites', icon: Heart, href: '/(app)/favorites' },
  { name: 'Addresses', icon: MapPin, href: '/(app)/addresses' },
  { name: 'Messages', icon: MessageSquare, href: '/(app)/messages' },
  { name: 'Settings', icon: Settings, href: '/(app)/settings' },
  { name: 'Support', icon: LifeBuoy, href: '/(app)/support' },
];

// --- Components ---

function ProfileLink({ name, icon, href }: (typeof ACCOUNT_LINKS)[0]) {
  return (
    <Link href={href} asChild>
      <Pressable className="flex-row items-center justify-between rounded-lg border border-border/50 bg-card p-4 active:bg-muted/50">
        <View className="flex-row items-center gap-4">
          <Icon as={icon} size={20} className="text-primary" />
          <Text className="text-base font-medium">{name}</Text>
        </View>
        <Text className="text-xl text-muted-foreground">{'>'}</Text>
      </Pressable>
    </Link>
  );
}

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isWeb = width >= 1024; // Tailwind 'lg' breakpoint

  // On web, this screen acts as a sidebar for nested routes.
  // On mobile, it's a list of links.

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-4 gap-6">
        <Text variant="h2" className="font-bold">
          My Profile
        </Text>

        {/* User Info Card */}
        <View className="flex-row items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <Avatar alt={MOCK_USER.name} className="size-16">
            <AvatarFallback className="bg-primary">
              <Text className="text-xl font-bold text-primary-foreground">
                {MOCK_USER.initials}
              </Text>
            </AvatarFallback>
          </Avatar>
          <View>
            <Text variant="h3" className="font-bold">
              {MOCK_USER.name}
            </Text>
            <Text className="text-sm text-muted-foreground">{MOCK_USER.email}</Text>
          </View>
          <Button variant="ghost" size="sm" className="ml-auto">
            <Icon as={User} size={20} />
          </Button>
        </View>

        {/* Navigation Links */}
        <View className="gap-3">
          <Text variant="large" className="font-semibold text-muted-foreground">
            Account
          </Text>
          {ACCOUNT_LINKS.map((link) => (
            <ProfileLink key={link.name} {...link} />
          ))}
        </View>

        <Separator className="my-4" />

        {/* Logout Button */}
        <Button variant="destructive" className="w-full">
          <Icon as={LogOut} size={20} />
          <Text>Log Out</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
