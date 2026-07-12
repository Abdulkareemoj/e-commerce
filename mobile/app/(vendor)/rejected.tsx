import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { XCircle, Store, LogOut, MessageCircle, ShoppingBag } from 'lucide-react-native';
import { useAuthStore } from '@/lib/authStore';

export default function VendorRejectedScreen() {
  const router = useRouter();
  const { clearAuth, updateUser } = useAuthStore();

  const handleLogout = async () => {
    await clearAuth();
    router.replace('/(auth)/sign-in');
  };

  const handleContinueAsShopper = () => {
    updateUser({ role: 'user', vendorStatus: null });
    router.replace('/(user)/(tabs)/home');
  };

  const handleContactSupport = () => {
    router.push('/(user)/(tabs)/profile/support');
  };

  return (
    <View className="bg-background flex-1">
      <View className="flex-1 px-6 pt-8 pb-6">
        <View className="mb-10 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <View className="bg-primary/10 h-9 w-9 items-center justify-center rounded-xl">
              <Icon as={Store} size={18} className="text-primary" />
            </View>
            <Text className="text-foreground text-base font-semibold">Vendor Portal</Text>
          </View>
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center gap-1.5 active:opacity-70">
            <Icon as={LogOut} size={16} className="text-muted-foreground" />
            <Text className="text-muted-foreground text-sm">Sign out</Text>
          </Pressable>
        </View>

        <View className="bg-card shadow-card mb-8 rounded-2xl p-6">
          <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
            <Icon as={XCircle} size={32} className="text-red-500" />
          </View>
          <Text className="text-foreground mb-2 text-xl font-bold">Application not approved</Text>
          <Text className="text-muted-foreground text-sm leading-relaxed">
            Unfortunately, your vendor application wasn't approved at this time. This could be due
            to incomplete information or eligibility requirements.
          </Text>
        </View>

        <View className="bg-card shadow-card mb-8 rounded-2xl p-5">
          <Text className="text-foreground mb-3 text-sm font-semibold">What now?</Text>
          <View className="gap-3">
            <View className="flex-row items-start gap-3">
              <View className="bg-primary/10 mt-0.5 h-5 w-5 items-center justify-center rounded-full">
                <Text className="text-primary text-xs font-bold">1</Text>
              </View>
              <Text className="text-muted-foreground flex-1 text-sm leading-relaxed">
                You can still browse and shop as a regular user.
              </Text>
            </View>
            <View className="flex-row items-start gap-3">
              <View className="bg-primary/10 mt-0.5 h-5 w-5 items-center justify-center rounded-full">
                <Text className="text-primary text-xs font-bold">2</Text>
              </View>
              <Text className="text-muted-foreground flex-1 text-sm leading-relaxed">
                Contact support to appeal the decision or get more details.
              </Text>
            </View>
            <View className="flex-row items-start gap-3">
              <View className="bg-primary/10 mt-0.5 h-5 w-5 items-center justify-center rounded-full">
                <Text className="text-primary text-xs font-bold">3</Text>
              </View>
              <Text className="text-muted-foreground flex-1 text-sm leading-relaxed">
                You can reapply later with updated store information.
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-auto gap-3">
          <Pressable
            onPress={handleContinueAsShopper}
            className="bg-primary h-14 items-center justify-center rounded-2xl active:opacity-85">
            <View className="flex-row items-center gap-2">
              <Icon as={ShoppingBag} size={18} className="text-primary-foreground" />
              <Text className="text-primary-foreground text-base font-bold">Continue shopping</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={handleContactSupport}
            className="bg-secondary h-12 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-75">
            <Icon as={MessageCircle} size={16} className="text-foreground" />
            <Text className="text-foreground text-sm font-semibold">Contact support</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
