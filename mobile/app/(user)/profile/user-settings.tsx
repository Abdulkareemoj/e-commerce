import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { MoonStarIcon, SunIcon, LogOut } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const handleSignOut = () => {
    // TODO: Implement actual sign out logic here later (e.g., using better-auth)
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-4 gap-6">
        <Text variant="h2" className="text-center sm:text-left">
          App Settings
        </Text>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Icon as={colorScheme === 'dark' ? MoonStarIcon : SunIcon} size={20} />
                <Text>Dark Mode</Text>
              </View>
              <Switch checked={colorScheme === 'dark'} onCheckedChange={toggleColorScheme} />
            </View>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <Button variant="destructive" onPress={handleSignOut} className="w-full">
              <Icon as={LogOut} />
              <Text>Log Out</Text>
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
