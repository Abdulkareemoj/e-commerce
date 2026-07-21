import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { FieldSet } from '@/components/ui/field';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().optional(),
  location: z.string().optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

export default function VendorProfileScreen() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const { control, handleSubmit, reset } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', bio: '', location: '' },
  });

  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/vendor/profile');
        const p = res.profile;
        reset({ name: p.name || '', bio: p.bio || '', location: p.location || '' });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [reset]);

  const onSubmit = React.useCallback(
    async (data: ProfileData) => {
      setSaving(true);
      try {
        const res = await api.put('/vendor/profile', data);
        if (res.profile) reset(res.profile);
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
      } finally {
        setSaving(false);
      }
    },
    [reset]
  );

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <ScrollView contentContainerClassName="p-4 gap-6">
        <Text variant="h2" className="font-bold">
          My Profile
        </Text>
        <Card className="p-4">
          <FieldSet>
            <FormInput control={control} name="name" label="Name" placeholder="Full name" />
            <FormInput
              control={control}
              name="bio"
              label="Bio"
              placeholder="Tell buyers about yourself"
              multiline
            />
            <FormInput
              control={control}
              name="location"
              label="Location"
              placeholder="City, Country"
            />
            <Button onPress={handleSubmit(onSubmit)} disabled={saving}>
              <Text>{saving ? 'Saving...' : 'Save Changes'}</Text>
            </Button>
          </FieldSet>
        </Card>
      </ScrollView>
    </View>
  );
}
