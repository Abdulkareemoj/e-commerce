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
} from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';

// Navigation Links
const ACCOUNT_LINKS = [
  { name: 'Orders', icon: Package, href: '/(app)/orders' },
  { name: 'Favorites', icon: Heart, href: '/(app)/favorites' },
  { name: 'Addresses', icon: MapPin, href: '/(app)/profile/addresses' },
  { name: 'Messages', icon: MessageSquare, href: '/(app)/messages' },
  { name: 'Settings', icon: Settings, href: '/(app)/settings' },
  { name: 'Support', icon: LifeBuoy, href: '/(app)/profile/support' },
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
  const isWeb = width >= 1024;
  const { user } = useAuthStore();
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const data = await api.get('/user/profile');
        setUserProfile(data.user);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  if (isLoading || !user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-red-500">Error: {error}</Text>
      </SafeAreaView>
    );
  }

  // Fallback if no user profile data is available after fetch (e.g., empty response)
  const displayUser = userProfile || user || { name: 'Guest', email: 'N/A', initials: 'G' };
  const displayName = displayUser.name || 'Guest User';
  const displayEmail = displayUser.email || 'N/A';
  const displayInitials = displayUser.name ? displayName.charAt(0).toUpperCase() : 'G';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-4 gap-6">
        <Text variant="h2" className="font-bold">
          My Profile
        </Text>

        {/* User Info Card */}
        <View className="flex-row items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <Avatar alt={displayName} className="size-16">
            <AvatarFallback className="bg-primary">
              <Text className="text-xl font-bold text-primary-foreground">{displayInitials}</Text>
            </AvatarFallback>
          </Avatar>
          <View>
            <Text variant="h3" className="font-bold">
              {displayName}
            </Text>
            <Text className="text-sm text-muted-foreground">{displayEmail}</Text>
          </View>
          <Link href="/(app)/profile/user-settings" asChild>
            <Button variant="ghost" size="sm" className="ml-auto">
              <Icon as={User} size={20} />
            </Button>
          </Link>
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
      </ScrollView>
    </SafeAreaView>
  );
}
