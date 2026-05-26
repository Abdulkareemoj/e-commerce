import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  MapPin,
  Settings,
  Heart,
  Package,
  MessageSquare,
  ChevronRight,
  LogOut,
  Bell,
  HelpCircle,
  Shield,
  Store,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { authClient } from '@/lib/auth-client';
import { signOut } from '@/lib/auth-client';
import { api } from '@/lib/api';

function ProfileLink({ name, icon, href }: { name: string; icon: any; href: string }) {
  return (
    <Link href={href as any} asChild>
      <Pressable className="flex-row items-center justify-between rounded-xl p-3 active:bg-muted/50">
        <View className="flex-row items-center gap-4">
          <View className="size-10 items-center justify-center rounded-xl bg-primary/10">
            <Icon as={icon} size={20} className="text-primary" />
          </View>
          <Text className="text-sm font-medium">{name}</Text>
        </View>
        <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
      </Pressable>
    </Link>
  );
}

type VendorStatus = 'pending' | 'approved' | 'rejected' | null;

export default function ProfileScreen() {
  const { data: session } = authClient.useSession();
  const [vendorStatus, setVendorStatus] = React.useState<{ isVerified: VendorStatus; storeName: string; storeSlug: string } | null | 'loading'>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/become-vendor');
        setVendorStatus(res.vendor || null);
      } catch {
        setVendorStatus(null);
      }
    })();
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  if (!session?.user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-muted-foreground">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  const displayUser = session.user;
  const displayName = displayUser.name || 'Guest User';
  const displayEmail = displayUser.email || 'N/A';
  const displayInitials = displayUser.name ? displayUser.name.charAt(0).toUpperCase() : 'G';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-8 gap-6" showsVerticalScrollIndicator={false}>
        <View className="gap-5 px-4 pt-4">
          <Text variant="h2" className="font-bold tracking-tight">
            Profile
          </Text>

          <Card className="flex-row items-center gap-4 p-4">
            <Avatar alt={displayName} className="size-16">
              <AvatarFallback className="bg-primary">
                <Text className="text-xl font-bold text-primary-foreground">{displayInitials}</Text>
              </AvatarFallback>
            </Avatar>
            <View className="flex-1">
              <Text variant="h3" className="font-bold tracking-tight">
                {displayName}
              </Text>
              <Text className="text-sm text-muted-foreground">{displayEmail}</Text>
            </View>
            <Link href="/(user)/(tabs)/profile/user-settings" asChild>
              <Button variant="outline" size="sm">
                <Icon as={User} size={16} />
                <Text className="text-xs font-medium">Edit</Text>
              </Button>
            </Link>
          </Card>

          <View className="gap-2">
            <Text className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Shopping
            </Text>
            <Card className="p-2">
              <ProfileLink name="My Orders" icon={Package} href="/(user)/orders" />
              <ProfileLink name="Favorites" icon={Heart} href="/(user)/favorites" />
              <ProfileLink name="Addresses" icon={MapPin} href="/(user)/(tabs)/profile/addresses" />
              <ProfileLink name="Messages" icon={MessageSquare} href="/(user)/messages" />
            </Card>
          </View>

          <View className="gap-2">
            <Text className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Selling
            </Text>
            <Card className="p-2">
              {vendorStatus === 'loading' ? (
                <View className="p-3">
                  <Text className="text-sm text-muted-foreground">Checking status...</Text>
                </View>
              ) : vendorStatus?.isVerified === 'approved' ? (
                <Pressable
                  onPress={() => router.replace('/(vendor)/(tabs)/dashboard')}
                  className="flex-row items-center justify-between rounded-xl p-3 active:bg-muted/50"
                >
                  <View className="flex-row items-center gap-4 flex-1">
                    <View className="size-10 items-center justify-center rounded-xl bg-emerald-500/10">
                      <Icon as={CheckCircle2} size={20} className="text-emerald-500" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-medium">Your Store</Text>
                      <Text className="text-xs text-muted-foreground">{vendorStatus.storeName}</Text>
                    </View>
                  </View>
                  <Badge variant="default" className="mr-2">
                    <Text className="text-xs font-medium">Live</Text>
                  </Badge>
                  <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
                </Pressable>
              ) : vendorStatus?.isVerified === 'pending' ? (
                <Pressable
                  onPress={() => router.push('/(user)/(tabs)/profile/become-vendor')}
                  className="flex-row items-center justify-between rounded-xl p-3 active:bg-muted/50"
                >
                  <View className="flex-row items-center gap-4 flex-1">
                    <View className="size-10 items-center justify-center rounded-xl bg-amber-500/10">
                      <Icon as={Clock} size={20} className="text-amber-500" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-medium">Vendor Application</Text>
                      <Text className="text-xs text-muted-foreground">{vendorStatus.storeName}</Text>
                    </View>
                  </View>
                  <Badge variant="outline" className="mr-2">
                    <Text className="text-xs font-medium">Pending</Text>
                  </Badge>
                  <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
                </Pressable>
              ) : vendorStatus?.isVerified === 'rejected' ? (
                <Pressable
                  onPress={() => router.push('/(user)/(tabs)/profile/become-vendor')}
                  className="flex-row items-center justify-between rounded-xl p-3 active:bg-muted/50"
                >
                  <View className="flex-row items-center gap-4 flex-1">
                    <View className="size-10 items-center justify-center rounded-xl bg-destructive/10">
                      <Icon as={XCircle} size={20} className="text-destructive" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-medium">Vendor Application</Text>
                      <Text className="text-xs text-destructive">Rejected — tap to reapply</Text>
                    </View>
                  </View>
                  <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => router.push('/(user)/(tabs)/profile/become-vendor')}
                  className="flex-row items-center justify-between rounded-xl p-3 active:bg-muted/50"
                >
                  <View className="flex-row items-center gap-4">
                    <View className="size-10 items-center justify-center rounded-xl bg-primary/10">
                      <Icon as={Store} size={20} className="text-primary" />
                    </View>
                    <Text className="text-sm font-medium">Become a Vendor</Text>
                  </View>
                  <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
                </Pressable>
              )}
            </Card>
          </View>

          <View className="gap-2">
            <Text className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Preferences
            </Text>
            <Card className="p-2">
              <ProfileLink name="Notifications" icon={Bell} href="/(user)/settings" />
              <ProfileLink name="Privacy & Security" icon={Shield} href="/(user)/settings" />
              <ProfileLink
                name="Help & Support"
                icon={HelpCircle}
                href="/(user)/(tabs)/profile/support"
              />
              <ProfileLink name="Settings" icon={Settings} href="/(user)/settings" />
            </Card>
          </View>

          <Pressable
            onPress={handleSignOut}
            className="flex-row items-center justify-center gap-2 rounded-xl p-4 active:bg-destructive/10">
            <Icon as={LogOut} size={20} className="text-destructive" />
            <Text className="font-medium text-destructive">Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
