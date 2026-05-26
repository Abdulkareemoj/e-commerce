import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  storeSlug: z.string().min(1, 'Store slug is required').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
});

type VendorData = z.infer<typeof vendorSchema>;
type VendorStatus = 'pending' | 'approved' | 'rejected' | null;

export default function BecomeVendorScreen() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [existingVendor, setExistingVendor] = React.useState<{ isVerified: VendorStatus; storeName: string; storeSlug: string } | null>(null);
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
        storeSlug: data.storeSlug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
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
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (existingVendor?.isVerified === 'approved') {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView contentContainerClassName="p-4 gap-6">
          <Alert variant="default" icon={CheckCircle2}>
            <AlertTitle>You're a Vendor!</AlertTitle>
            <AlertDescription>
              Your store "{existingVendor.storeName}" is approved and live.
            </AlertDescription>
          </Alert>
          <Button onPress={() => router.replace('/(vendor)/(tabs)/dashboard')}>
            <Icon as={Store} size={16} />
            <Text>Go to Vendor Dashboard</Text>
          </Button>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (existingVendor?.isVerified === 'pending') {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView contentContainerClassName="p-4 gap-6">
          <Alert variant="default" icon={Clock}>
            <AlertTitle>Application Pending</AlertTitle>
            <AlertDescription>
              Your application for "{existingVendor.storeName}" is under review. We'll notify you once it's approved.
            </AlertDescription>
          </Alert>
          <Card>
            <CardHeader>
              <CardTitle>Submitted Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="text-muted-foreground">Store: {existingVendor.storeName}</Text>
              <Text className="text-muted-foreground">URL: /{existingVendor.storeSlug}</Text>
            </CardContent>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (existingVendor?.isVerified === 'rejected') {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView contentContainerClassName="p-4 gap-6">
          <View>
            <Text variant="h2" className="font-bold">Become a Vendor</Text>
            <Text className="text-muted-foreground mt-1">Your previous application was rejected. You can submit a new one.</Text>
          </View>
          <VendorForm
            control={control}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            status={status}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-4 gap-6">
        <View>
          <Text variant="h2" className="font-bold">Become a Vendor</Text>
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
    </SafeAreaView>
  );
}

function VendorForm({
  control, isSubmitting, handleSubmit, onSubmit, status,
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
        <Alert variant={status.type === 'error' ? 'destructive' : 'default'} icon={status.type === 'error' ? AlertCircle : CheckCircle2}>
          <AlertTitle>{status.type === 'success' ? 'Application Submitted' : 'Error'}</AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Store Details</CardTitle>
          <CardDescription>This information will be shown on your public store page.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FormInput control={control} name="storeName" label="Store Name" placeholder="My Awesome Store" />
            <FormInput control={control} name="storeSlug" label="Store URL" placeholder="my-awesome-store" autoCapitalize="none" />
            <FormInput control={control} name="description" label="Description" placeholder="Tell customers about your store..." multiline />
            <Button className="w-full" onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
              <Text>{isSubmitting ? 'Submitting...' : 'Submit Application'}</Text>
            </Button>
          </FieldSet>
        </CardContent>
      </Card>
    </>
  );
}
