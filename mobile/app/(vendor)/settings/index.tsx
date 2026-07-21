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

const storeSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  storeSlug: z
    .string()
    .min(1, 'Store slug is required')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  payoutDetails: z.string().optional(),
});

type StoreData = z.infer<typeof storeSchema>;

export default function VendorSettingsScreen() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const { control, handleSubmit, reset } = useForm<StoreData>({
    resolver: zodResolver(storeSchema),
    defaultValues: { storeName: '', storeSlug: '', description: '', payoutDetails: '' },
  });

  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/vendor/store');
        const s = res.store;
        reset({
          storeName: s.storeName || '',
          storeSlug: s.storeSlug || '',
          description: s.description || '',
          payoutDetails: s.payoutDetails || '',
        });
      } catch (err) {
        console.error('Failed to load store:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [reset]);

  const onSubmit = React.useCallback(
    async (data: StoreData) => {
      setSaving(true);
      try {
        const res = await api.put('/vendor/store', data);
        if (res.store)
          reset({
            storeName: res.store.storeName || '',
            storeSlug: res.store.storeSlug || '',
            description: res.store.description || '',
            payoutDetails: res.store.payoutDetails || '',
          });
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to update store settings.', variant: 'destructive' });
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
          Store Settings
        </Text>
        <Card className="p-4">
          <FieldSet>
            <FormInput
              control={control}
              name="storeName"
              label="Store Name"
              placeholder="My Store"
            />
            <FormInput
              control={control}
              name="storeSlug"
              label="Store Slug"
              placeholder="my-store"
              autoCapitalize="none"
            />
            <FormInput
              control={control}
              name="description"
              label="Description"
              placeholder="Tell customers about your store"
              multiline
            />
            <FormInput
              control={control}
              name="payoutDetails"
              label="Payout Details"
              placeholder="Bank account or payment provider info"
              multiline
            />
            <Button onPress={handleSubmit(onSubmit)} disabled={saving}>
              <Text>{saving ? 'Saving...' : 'Save Settings'}</Text>
            </Button>
          </FieldSet>
        </Card>
      </ScrollView>
    </View>
  );
}
