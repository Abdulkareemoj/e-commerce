import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScrollView, View, ActivityIndicator, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { FieldSet } from '@/components/ui/field';
import { AlertCircle, CheckCircle2, Clock, Store, RefreshCw, Mail } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/authStore';

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

function TimelineStep({
  label,
  done,
  active,
  last,
}: {
  label: string;
  done: boolean;
  active: boolean;
  last?: boolean;
}) {
  return (
    <View className="flex-row gap-3">
      <View className="items-center">
        <View
          className={`h-6 w-6 items-center justify-center rounded-full ${
            done ? 'bg-green-100' : active ? 'bg-amber-100' : 'bg-secondary'
          }`}>
          {done ? (
            <Icon as={CheckCircle2} size={14} className="text-green-600" />
          ) : active ? (
            <View className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          ) : (
            <View className="bg-muted-foreground h-2 w-2 rounded-full" />
          )}
        </View>
        {!last && (
          <View
            className="my-0.5 w-px flex-1"
            style={{ backgroundColor: done ? '#34d39940' : '#d4d4d840', minHeight: 18 }}
          />
        )}
      </View>
      <Text
        className={`pb-4 text-sm ${
          done ? 'text-green-600' : active ? 'text-amber-600' : 'text-muted-foreground'
        }`}>
        {label}
      </Text>
    </View>
  );
}

export default function BecomeVendorScreen() {
  const { user } = useAuthStore();
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
  const [checking, setChecking] = React.useState(false);
  const [lastChecked, setLastChecked] = React.useState<Date | null>(null);

  const { control, handleSubmit, setValue } = useForm<VendorData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: { storeName: '', storeSlug: '', description: '' },
  });

  const fetchVendor = React.useCallback(async ({ silent = false } = {}) => {
    if (silent) setChecking(true);
    try {
      const res = await api.get('/become-vendor');
      if (res.vendor) {
        setExistingVendor(res.vendor);
        setValue('storeName', res.vendor.storeName || '');
        setValue('storeSlug', res.vendor.storeSlug || '');
        setValue('description', res.vendor.description || '');
        if (res.vendor.isVerified === 'approved') {
          setTimeout(() => router.replace('/(vendor)/(tabs)/dashboard'), 1500);
        }
      }
      if (silent) setLastChecked(new Date());
    } catch {
      // No vendor record found - show form
    } finally {
      setLoading(false);
      if (silent) setChecking(false);
    }
  }, [setValue]);

  React.useEffect(() => {
    fetchVendor();
  }, []);

  // Live-poll only while pending — approval or rejection is a one-time
  // transition the applicant needs to see without navigating away and back.
  React.useEffect(() => {
    if (existingVendor?.isVerified !== 'pending') return;
    const id = setInterval(() => fetchVendor({ silent: true }), 30_000);
    return () => clearInterval(id);
  }, [existingVendor?.isVerified, fetchVendor]);

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
              {user?.email && (
                <View className="bg-secondary flex-row items-center gap-2 rounded-xl px-4 py-3">
                  <Icon as={Mail} size={14} className="text-muted-foreground" />
                  <Text className="text-muted-foreground flex-1 text-xs" numberOfLines={1}>
                    Decision sent to <Text className="text-foreground">{user.email}</Text>
                  </Text>
                </View>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border rounded-2xl border px-1 pt-4 pb-0">
            <CardContent>
              <Text className="text-muted-foreground mb-4 text-xs font-semibold tracking-widest uppercase">
                Application progress
              </Text>
              <TimelineStep label="Account created" done={true} active={false} />
              <TimelineStep label="Application submitted" done={true} active={false} />
              <TimelineStep label="Under review" done={false} active={true} last />
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

          <Pressable
            onPress={() => fetchVendor({ silent: true })}
            disabled={checking}
            className="bg-secondary h-12 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-75">
            {checking ? (
              <ActivityIndicator size="small" className="text-primary" />
            ) : (
              <>
                <Icon as={RefreshCw} size={16} className="text-primary" />
                <Text className="text-primary text-sm font-semibold">Check status</Text>
              </>
            )}
          </Pressable>
          {lastChecked && (
            <Text className="text-muted-foreground text-center text-xs">
              Last checked: {lastChecked.toLocaleTimeString()}
            </Text>
          )}
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
            <FormInput control={control} name="storeName" label="Store Name" placeholder="My Awesome Store" />
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
            <Button className="mt-2 w-full rounded-xl" onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
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