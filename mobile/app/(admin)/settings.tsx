import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { FieldSet } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Uniwind, useUniwind } from 'uniwind';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import { router } from 'expo-router';
import { Shield, Lock, Moon, Sun, LogOut, CheckCircle2 } from 'lucide-react-native';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().optional(),
  location: z.string().optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

export default function AdminSettingsScreen() {
  const { user, clearAuth } = useAuthStore();
  const { theme } = useUniwind();
  const isDark = theme === 'dark';
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', bio: '', location: '' },
  });

  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/admin/profile');
        const p = res.profile;
        reset({
          name: p.name || '',
          bio: p.bio || '',
          location: p.location || '',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [reset]);

  const onSubmit = React.useCallback(async (data: ProfileData) => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/admin/profile', data);
      setMessage('Profile saved successfully.');
    } catch (err) {
      setMessage('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }, []);

  const handleSignOut = async () => {
    await clearAuth();
    router.replace('/(auth)/sign-in');
  };

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const displayName = user?.name || 'Admin';
  const displayEmail = user?.email || '';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <ScrollView contentContainerClassName="p-4 gap-6 bg-background">
      {/* Profile Header */}
      <View className="bg-muted/30 flex-row items-center gap-4 rounded-xl p-4">
        <View className="size-14 items-center justify-center rounded-full bg-amber-500/20">
          <Text className="text-2xl font-bold text-amber-500">{initial}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold">{displayName}</Text>
          <Text className="text-muted-foreground text-sm">{displayEmail}</Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <Icon as={Shield} size={12} className="text-amber-500" />
            <Text className="text-xs font-medium text-amber-500">Admin</Text>
          </View>
        </View>
      </View>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FormInput control={control} name="name" label="Name" placeholder="Full name" />
            <FormInput
              control={control}
              name="bio"
              label="Bio"
              placeholder="Tell us about yourself"
              multiline
            />
            <FormInput
              control={control}
              name="location"
              label="Location"
              placeholder="City, Country"
            />
            {message && (
              <View className="flex-row items-center gap-2">
                <Icon as={CheckCircle2} size={14} className="text-emerald-500" />
                <Text className="text-sm text-emerald-500">{message}</Text>
              </View>
            )}
            <Button onPress={handleSubmit(onSubmit)} disabled={saving}>
              <Text>{saving ? 'Saving...' : 'Save Changes'}</Text>
            </Button>
          </FieldSet>
        </CardContent>
      </Card>

      <Separator />

      {/* Appearance */}
      <View className="gap-3">
        <Text className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Appearance
        </Text>
        <Card>
          <CardContent className="p-4">
            <Pressable
              onPress={() => Uniwind.setTheme(isDark ? 'light' : 'dark')}
              className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Icon as={isDark ? Moon : Sun} size={20} className="text-primary" />
                <Text className="text-base font-medium">Dark Mode</Text>
              </View>
              <Switch
                checked={isDark}
                onCheckedChange={(v) => Uniwind.setTheme(v ? 'dark' : 'light')}
              />
            </Pressable>
          </CardContent>
        </Card>
      </View>

      <Separator />

      {/* Security */}
      <View className="gap-3">
        <Text className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Security
        </Text>
        <Card>
          <CardContent className="p-4">
            <Pressable className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Icon as={Lock} size={20} className="text-primary" />
                <View>
                  <Text className="text-base font-medium">Change Password</Text>
                  <Text className="text-muted-foreground text-sm">Update your admin password</Text>
                </View>
              </View>
            </Pressable>
          </CardContent>
        </Card>
      </View>

      <Separator />

      {/* Sign Out */}
      <Button variant="destructive" onPress={handleSignOut} className="w-full">
        <Icon as={LogOut} size={16} />
        <Text>Sign Out</Text>
      </Button>

      <Text className="text-muted-foreground mt-2 text-center text-xs">
        Marketplace Admin v1.0.0
      </Text>
    </ScrollView>
  );
}
