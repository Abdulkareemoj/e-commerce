import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Link } from 'expo-router';
import { LogIn, type LucideIcon } from 'lucide-react-native';
import { useAuthStore } from '@/lib/authStore';

type Props = {
  children: React.ReactNode;
  icon?: LucideIcon;
  message?: string;
  roleMessage?: string;
  requiredRole?: 'user' | 'vendor' | 'admin';
};

export function AuthGuard({
  children,
  icon: FallbackIcon = LogIn,
  message = 'Sign in to access this page.',
  roleMessage,
  requiredRole,
}: Props) {
  const { user, isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  React.useEffect(() => {
    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="small" className="text-foreground" />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView className="bg-background flex-1">
        <View className="flex-1 items-center justify-center gap-4 p-6">
          <Icon as={FallbackIcon} size={40} className="text-muted-foreground" />
          <Text className="text-muted-foreground text-center">{message}</Text>
          <Link href="/(auth)/sign-in" asChild>
            <Button variant="default">
              <Text>Sign In</Text>
            </Button>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <SafeAreaView className="bg-background flex-1">
        <View className="flex-1 items-center justify-center gap-4 p-6">
          <Icon as={FallbackIcon} size={40} className="text-muted-foreground" />
          <Text className="text-muted-foreground text-center">
            {roleMessage || `This page requires a ${requiredRole} account.`}
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Button variant="default">
              <Text>Sign In</Text>
            </Button>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
}
