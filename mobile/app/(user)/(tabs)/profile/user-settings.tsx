import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { MoonStarIcon, SunIcon, LogOut } from 'lucide-react-native';
import { Uniwind, useUniwind } from 'uniwind';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useAuthStore } from '@/lib/authStore';

export default function SettingsScreen() {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';
  const toggleColorScheme = () => Uniwind.setTheme(isDark ? 'light' : 'dark');
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleSignOut = async () => {
    await clearAuth();
    router.replace('/(auth)/sign-in');
  };

  return (
    <View className="bg-background flex-1">
      <View className="bg-card border-border items-center justify-center border-b px-5 py-4">
        <Text className="text-foreground text-lg font-bold">App Settings</Text>
      </View>
      <ScrollView contentContainerClassName="p-4 gap-6">
        <Card className="bg-card border-border rounded-2xl border">
          <CardHeader>
            <CardTitle className="text-foreground">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="bg-primary/10 size-10 items-center justify-center rounded-xl">
                  <Icon as={isDark ? MoonStarIcon : SunIcon} size={18} className="text-primary" />
                </View>
                <Text className="text-foreground font-medium">Dark Mode</Text>
              </View>
              <Switch checked={isDark} onCheckedChange={toggleColorScheme} />
            </View>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-2xl border">
          <CardHeader>
            <CardTitle className="text-foreground">Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <Button variant="destructive" onPress={handleSignOut} className="w-full rounded-xl">
              <Icon as={LogOut} size={16} />
              <Text className="font-semibold">Log Out</Text>
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
}
