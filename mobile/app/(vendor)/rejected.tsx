import React from 'react';
import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    // Could navigate to a support chat or email form
    router.replace('/(user)/(tabs)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <View className="flex-1 px-6 pt-8 pb-6">
        {/* Header */}
        <View className="mb-10 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10">
              <Icon as={Store} size={18} color="#fbbf24" />
            </View>
            <Text className="text-base font-semibold text-white">Vendor Portal</Text>
          </View>
          <Pressable onPress={handleLogout} className="flex-row items-center gap-1.5 active:opacity-70">
            <Icon as={LogOut} size={16} color="#71717a" />
            <Text className="text-sm text-zinc-500">Sign out</Text>
          </Pressable>
        </View>

        {/* Rejected card */}
        <View className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <Icon as={XCircle} size={32} color="#f87171" />
          </View>

          <Text className="mb-2 text-xl font-bold text-white">Application not approved</Text>
          <Text className="text-sm leading-relaxed text-zinc-400">
            Unfortunately, your vendor application wasn't approved at this time. This could be due to
            incomplete information or eligibility requirements.
          </Text>
        </View>

        {/* What now */}
        <View className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <Text className="mb-3 text-sm font-semibold text-white">What now?</Text>
          <View className="gap-3">
            <View className="flex-row items-start gap-3">
              <View className="mt-0.5 h-5 w-5 items-center justify-center rounded-full bg-zinc-800">
                <Text className="text-xs font-bold text-zinc-400">1</Text>
              </View>
              <Text className="flex-1 text-sm leading-relaxed text-zinc-400">
                You can still browse and shop as a regular user.
              </Text>
            </View>
            <View className="flex-row items-start gap-3">
              <View className="mt-0.5 h-5 w-5 items-center justify-center rounded-full bg-zinc-800">
                <Text className="text-xs font-bold text-zinc-400">2</Text>
              </View>
              <Text className="flex-1 text-sm leading-relaxed text-zinc-400">
                Contact support to appeal the decision or get more details.
              </Text>
            </View>
            <View className="flex-row items-start gap-3">
              <View className="mt-0.5 h-5 w-5 items-center justify-center rounded-full bg-zinc-800">
                <Text className="text-xs font-bold text-zinc-400">3</Text>
              </View>
              <Text className="flex-1 text-sm leading-relaxed text-zinc-400">
                You can reapply later with updated store information.
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="mt-auto gap-3">
          <Pressable
            onPress={handleContinueAsShopper}
            className="h-14 items-center justify-center rounded-2xl bg-amber-400 active:opacity-85">
            <View className="flex-row items-center gap-2">
              <Icon as={ShoppingBag} size={18} color="#09090b" />
              <Text className="text-base font-bold text-zinc-950">Continue shopping</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={handleContactSupport}
            className="h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-zinc-700 active:opacity-75">
            <Icon as={MessageCircle} size={16} color="#a1a1aa" />
            <Text className="text-sm font-semibold text-zinc-400">Contact support</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
