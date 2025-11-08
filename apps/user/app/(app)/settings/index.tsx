import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useColorScheme } from 'nativewind';
import { Moon, Sun, Lock, Globe, ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

// --- Components ---

function SettingItem({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon: React.ComponentProps<typeof Icon>['as'];
  action: 'link' | 'switch' | 'button';
}) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const renderAction = () => {
    switch (action) {
      case 'switch':
        return (
          <Switch
            checked={isDarkMode}
            onCheckedChange={() => setColorScheme(isDarkMode ? 'light' : 'dark')}
          />
        );
      case 'link':
        return <Icon as={ChevronRight} size={20} className="text-muted-foreground" />;
      case 'button':
        return (
          <Button variant="outline" size="sm">
            <Text>Change</Text>
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Pressable
      className={`flex-row items-center justify-between rounded-lg p-3 ${
        action === 'link' ? 'active:bg-muted/50' : ''
      }`}>
      <View className="flex-1 flex-row items-center gap-4">
        <Icon as={icon} size={24} className="text-primary" />
        <View className="flex-1">
          <Text className="text-base font-medium">{title}</Text>
          {description && <Text className="text-sm text-muted-foreground">{description}</Text>}
        </View>
      </View>
      {renderAction()}
    </Pressable>
  );
}

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="border-b border-border p-4">
        <Text variant="h2" className="font-bold">
          Settings
        </Text>
      </View>
      <ScrollView contentContainerClassName="p-4 gap-6">
        {/* Appearance */}
        <View className="gap-2">
          <Text variant="large" className="font-semibold text-muted-foreground">
            Appearance
          </Text>
          <SettingItem
            title="Dark Mode"
            description="Toggle between light and dark themes."
            icon={Moon}
            action="switch"
          />
          <SettingItem title="Language" description="English (US)" icon={Globe} action="link" />
        </View>

        <Separator />

        {/* Security */}
        <View className="gap-2">
          <Text variant="large" className="font-semibold text-muted-foreground">
            Security
          </Text>
          <SettingItem
            title="Change Password"
            description="Update your account password."
            icon={Lock}
            action="link"
          />
          <SettingItem
            title="Two-Factor Authentication"
            description="Disabled"
            icon={Lock}
            action="link"
          />
        </View>

        <Separator />

        {/* Legal */}
        <View className="gap-2">
          <Text variant="large" className="font-semibold text-muted-foreground">
            Legal & Info
          </Text>
          <Link href="/(app)/settings/privacy" asChild>
            <SettingItem title="Privacy Policy" icon={Lock} action="link" />
          </Link>
          <Link href="/(app)/settings/terms" asChild>
            <SettingItem title="Terms of Service" icon={Lock} action="link" />
          </Link>
          <Text className="mt-4 text-center text-xs text-muted-foreground">App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
