import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { FieldSet } from '@/components/ui/field';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Clock, Store } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { api } from '@/lib/api';
import { router } from 'expo-router';

const vendorSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  storeSlug: z
    .string()
    .min(1, 'Store slug is required')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
});

type VendorData = z.infer<typeof vendorSchema>;
type VendorStatus = 'pending' | 'approved' | 'rejected' | null;

export default function BecomeVendorScreen() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [existingVendor, setExistingVendor] = React.useState<{
    isVerified: VendorStatus;
    storeName: string;
    storeSlug: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  const { control, handleSubmit, setValue } = useForm<VendorData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: { storeName: '', storeSlug: '', description: '' },
  });

  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/become-vendor');
        if (res.vendor) {
          setExistingVendor(res.vendor);
          setValue('storeName', res.vendor.storeName || '');
          setValue('storeSlug', res.vendor.storeSlug || '');
          setValue('description', res.vendor.description || '');
        }
      } catch (err) {
        // No vendor record found - show form
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSubmit = React.useCallback(async (data: VendorData) => {
    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await api.post('/become-vendor', {
        ...data,
        storeSlug: data.storeSlug
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
        description: data.description?.trim() || undefined,
      });

      setExistingVendor(res.vendor);
      setStatus({
        type: 'success',
        message: res.message || 'Application submitted successfully! We will review it shortly.',
      });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to submit application.' });
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="hsl(var(--primary))" />
      </View>
    );
  }

  if (existingVendor?.isVerified === 'approved') {
    return (
      <View className="bg-background flex-1">
        <ScrollView contentContainerClassName="p-4 gap-6">
          <Card className="bg-success/10 border-success/20 rounded-2xl">
            <CardContent className="gap-3 pt-4">
              <View className="bg-success/20 size-12 items-center justify-center rounded-full">
                <Icon as={CheckCircle2} size={24} className="text-success" />
              </View>
              <Text className="text-foreground text-lg font-bold">You're a Vendor!</Text>
              <Text className="text-muted-foreground">
                Your store "{existingVendor.storeName}" is approved and live.
              </Text>
              <Button
                onPress={() => router.replace('/(vendor)/(tabs)/dashboard')}
                className="mt-2 rounded-xl">
                <Icon as={Store} size={16} className="text-primary-foreground" />
                <Text className="text-primary-foreground font-semibold">
                  Go to Vendor Dashboard
                </Text>
              </Button>
            </CardContent>
          </Card>
        </ScrollView>
      </View>
    );
  }

  if (existingVendor?.isVerified === 'pending') {
    return (
      <View className="bg-background flex-1">
        <ScrollView contentContainerClassName="p-4 gap-6">
          <Card className="bg-warning/10 border-warning/20 rounded-2xl">
            <CardContent className="gap-3 pt-4">
              <View className="bg-warning/20 size-12 items-center justify-center rounded-full">
                <Icon as={Clock} size={24} className="text-warning" />
              </View>
              <Text className="text-foreground text-lg font-bold">Application Pending</Text>
              <Text className="text-muted-foreground">
                Your application for "{existingVendor.storeName}" is under review. We'll notify you
                once it's approved.
              </Text>
            </CardContent>
          </Card>
          <Card className="bg-card border-border rounded-2xl border">
            <CardHeader>
              <CardTitle className="text-foreground">Submitted Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="text-muted-foreground">Store: {existingVendor.storeName}</Text>
              <Text className="text-muted-foreground">URL: /{existingVendor.storeSlug}</Text>
            </CardContent>
          </Card>
        </ScrollView>
      </View>
    );
  }

  if (existingVendor?.isVerified === 'rejected') {
    return (
      <View className="bg-background flex-1">
        <ScrollView contentContainerClassName="p-4 gap-6">
          <View>
            <Text className="text-foreground text-lg font-bold">Become a Vendor</Text>
            <Text className="text-muted-foreground mt-1">
              Your previous application was rejected. You can submit a new one.
            </Text>
          </View>
          <VendorForm
            control={control}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            status={status}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <ScrollView contentContainerClassName="p-4 gap-6">
        <View>
          <Text className="text-foreground text-lg font-bold">Become a Vendor</Text>
          <Text className="text-muted-foreground mt-1">Set up your store to start selling.</Text>
        </View>

        <VendorForm
          control={control}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          status={status}
        />
      </ScrollView>
    </View>
  );
}

function VendorForm({
  control,
  isSubmitting,
  handleSubmit,
  onSubmit,
  status,
}: {
  control: any;
  isSubmitting: boolean;
  handleSubmit: any;
  onSubmit: (data: VendorData) => void;
  status: { type: string; message: string } | null;
}) {
  return (
    <>
      {status && (
        <Card
          className={
            status.type === 'error'
              ? 'bg-destructive/10 border-destructive/20 rounded-2xl'
              : 'bg-success/10 border-success/20 rounded-2xl'
          }>
          <CardContent className="flex-row items-center gap-3 pt-4">
            <Icon
              as={status.type === 'error' ? AlertCircle : CheckCircle2}
              size={20}
              className={status.type === 'error' ? 'text-destructive' : 'text-success'}
            />
            <View className="flex-1">
              <Text className="text-foreground font-semibold">
                {status.type === 'success' ? 'Application Submitted' : 'Error'}
              </Text>
              <Text className="text-muted-foreground text-sm">{status.message}</Text>
            </View>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border rounded-2xl border">
        <CardHeader>
          <CardTitle className="text-foreground">Store Details</CardTitle>
          <CardDescription className="text-muted-foreground">
            This information will be shown on your public store page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FormInput
              control={control}
              name="storeName"
              label="Store Name"
              placeholder="My Awesome Store"
            />
            <FormInput
              control={control}
              name="storeSlug"
              label="Store URL"
              placeholder="my-awesome-store"
              autoCapitalize="none"
            />
            <FormInput
              control={control}
              name="description"
              label="Description"
              placeholder="Tell customers about your store..."
              multiline
            />
            <Button
              className="mt-2 w-full rounded-xl"
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}>
              <Text className="text-primary-foreground font-semibold">
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Text>
            </Button>
          </FieldSet>
        </CardContent>
      </Card>
    </>
  );
}
