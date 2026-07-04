import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { api } from '@/lib/api';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuthStore } from '@/lib/authStore';

function ProfileLink({ name, icon, href }: { name: string; icon: any; href: string }) {
  return (
    <Link href={href as any} asChild>
      <Pressable className="active:bg-secondary/50 flex-row items-center justify-between rounded-xl p-3">
        <View className="flex-row items-center gap-3">
          <View className="bg-secondary size-9 items-center justify-center rounded-xl">
            <Icon as={icon} size={18} className="text-foreground" />
          </View>
          <Text className="text-foreground text-sm font-medium">{name}</Text>
        </View>
        <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
      </Pressable>
    </Link>
  );
}

type VendorStatus = 'pending' | 'approved' | 'rejected' | null;

export default function ProfileScreen() {
  const { user: displayUser, clearAuth } = useAuthStore();
  const [vendorStatus, setVendorStatus] = React.useState<
    { isVerified: VendorStatus; storeName: string; storeSlug: string } | null | 'loading'
  >(null);

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
    await clearAuth();
  };

  const displayName = displayUser?.name || 'Guest User';
  const displayEmail = displayUser?.email || 'N/A';
  const displayInitials = displayUser?.name ? displayUser.name.charAt(0).toUpperCase() : 'G';

  return (
    <AuthGuard icon={User} message="Sign in to view your profile.">
      <SafeAreaView className="bg-background flex-1">
        <ScrollView contentContainerClassName="pb-8 gap-5" showsVerticalScrollIndicator={false}>
          <View className="gap-5 px-5 pt-4">
            <Text className="text-foreground text-xl font-bold">Profile</Text>

            <View className="bg-card shadow-card flex-row items-center gap-4 rounded-2xl p-4">
              <Avatar alt={displayName} className="size-14">
                <AvatarFallback className="bg-primary">
                  <Text className="text-primary-foreground text-lg font-bold">
                    {displayInitials}
                  </Text>
                </AvatarFallback>
              </Avatar>
              <View className="flex-1">
                <Text className="text-foreground text-base font-bold">{displayName}</Text>
                <Text className="text-muted-foreground text-sm">{displayEmail}</Text>
              </View>
              <Link href="/(user)/(tabs)/profile/user-settings" asChild>
                <Pressable className="bg-secondary rounded-xl px-3 py-2">
                  <Text className="text-foreground text-xs font-medium">Edit</Text>
                </Pressable>
              </Link>
            </View>

            <View className="gap-2.5">
              <Text className="text-muted-foreground px-1 text-xs font-semibold tracking-wider uppercase">
                Shopping
              </Text>
              <View className="bg-card shadow-card gap-1 rounded-2xl p-2">
                <ProfileLink name="My Orders" icon={Package} href="/(user)/orders" />
                <ProfileLink name="Favorites" icon={Heart} href="/(user)/(tabs)/favorites" />
                <ProfileLink
                  name="Addresses"
                  icon={MapPin}
                  href="/(user)/(tabs)/profile/addresses"
                />
                <ProfileLink name="Messages" icon={MessageSquare} href="/(user)/messages" />
              </View>
            </View>

            <View className="gap-2.5">
              <Text className="text-muted-foreground px-1 text-xs font-semibold tracking-wider uppercase">
                Selling
              </Text>
              <View className="bg-card shadow-card rounded-2xl p-2">
                {vendorStatus === 'loading' ? (
                  <View className="p-3">
                    <Text className="text-muted-foreground text-sm">Checking status...</Text>
                  </View>
                ) : vendorStatus?.isVerified === 'approved' ? (
                  <Pressable
                    onPress={() => router.replace('/(vendor)/(tabs)/dashboard')}
                    className="active:bg-secondary/50 flex-row items-center justify-between rounded-xl p-3">
                    <View className="flex-1 flex-row items-center gap-3">
                      <View className="size-9 items-center justify-center rounded-xl bg-emerald-500/10">
                        <Icon as={CheckCircle2} size={18} className="text-emerald-500" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-foreground text-sm font-medium">Your Store</Text>
                        <Text className="text-muted-foreground text-xs">
                          {vendorStatus.storeName}
                        </Text>
                      </View>
                    </View>
                    <View className="rounded-full bg-emerald-500/10 px-2.5 py-1">
                      <Text className="text-xs font-medium text-emerald-600">Live</Text>
                    </View>
                  </Pressable>
                ) : vendorStatus?.isVerified === 'pending' ? (
                  <Pressable
                    onPress={() => router.push('/(user)/(tabs)/profile/become-vendor')}
                    className="active:bg-secondary/50 flex-row items-center justify-between rounded-xl p-3">
                    <View className="flex-1 flex-row items-center gap-3">
                      <View className="size-9 items-center justify-center rounded-xl bg-amber-500/10">
                        <Icon as={Clock} size={18} className="text-amber-500" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-foreground text-sm font-medium">
                          Vendor Application
                        </Text>
                        <Text className="text-muted-foreground text-xs">
                          {vendorStatus.storeName}
                        </Text>
                      </View>
                    </View>
                    <View className="rounded-full bg-amber-500/10 px-2.5 py-1">
                      <Text className="text-xs font-medium text-amber-600">Pending</Text>
                    </View>
                  </Pressable>
                ) : vendorStatus?.isVerified === 'rejected' ? (
                  <Pressable
                    onPress={() => router.push('/(user)/(tabs)/profile/become-vendor')}
                    className="active:bg-secondary/50 flex-row items-center justify-between rounded-xl p-3">
                    <View className="flex-1 flex-row items-center gap-3">
                      <View className="bg-destructive/10 size-9 items-center justify-center rounded-xl">
                        <Icon as={XCircle} size={18} className="text-destructive" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-foreground text-sm font-medium">
                          Vendor Application
                        </Text>
                        <Text className="text-destructive text-xs">Rejected — tap to reapply</Text>
                      </View>
                    </View>
                    <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => router.push('/(user)/(tabs)/profile/become-vendor')}
                    className="active:bg-secondary/50 flex-row items-center justify-between rounded-xl p-3">
                    <View className="flex-row items-center gap-3">
                      <View className="bg-primary/10 size-9 items-center justify-center rounded-xl">
                        <Icon as={Store} size={18} className="text-primary" />
                      </View>
                      <Text className="text-foreground text-sm font-medium">Become a Vendor</Text>
                    </View>
                    <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
                  </Pressable>
                )}
              </View>
            </View>

            <View className="gap-2.5">
              <Text className="text-muted-foreground px-1 text-xs font-semibold tracking-wider uppercase">
                Preferences
              </Text>
              <View className="bg-card shadow-card gap-1 rounded-2xl p-2">
                <ProfileLink name="Notifications" icon={Bell} href="/(user)/settings" />
                <ProfileLink name="Privacy & Security" icon={Shield} href="/(user)/settings" />
                <ProfileLink
                  name="Help & Support"
                  icon={HelpCircle}
                  href="/(user)/(tabs)/profile/support"
                />
                <ProfileLink name="Settings" icon={Settings} href="/(user)/settings" />
              </View>
            </View>

            <Pressable
              onPress={handleSignOut}
              className="border-destructive/20 active:bg-destructive/5 flex-row items-center justify-center gap-2 rounded-2xl border p-4">
              <Icon as={LogOut} size={18} className="text-destructive" />
              <Text className="text-destructive font-medium">Sign Out</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AuthGuard>
  );
}
