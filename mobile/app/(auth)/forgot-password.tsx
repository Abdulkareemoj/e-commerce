import * as React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { api } from '@/lib/api';
import { Link, router } from 'expo-router';
import { AlertCircle, CheckCircle2, GalleryVerticalEnd } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const onSubmit = React.useCallback(async () => {
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await api.publicPost('/auth/forgot-password', { email });
      setSuccess('A password reset code has been sent to your email.');
      setTimeout(() => {
        router.push({ pathname: '/(auth)/reset-password', params: { email } });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email]);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="flex-1 items-center justify-center p-6"
      keyboardDismissMode="interactive">
      <View className="w-full max-w-sm">
        <FieldGroup className="gap-6">
          <View className="flex flex-col items-center gap-2 text-center">
            <View className="flex size-10 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="text-foreground size-6" />
            </View>
            <Text className="text-xl font-bold">Forgot password?</Text>
            <FieldDescription>
              Enter your email address and we&apos;ll send you a code to reset your password.
            </FieldDescription>
          </View>

          {error && (
            <Alert variant="destructive" icon={AlertCircle}>
              <AlertTitle>Request Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" icon={CheckCircle2}>
              <AlertTitle>Check your email</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <View className="flex flex-col gap-4">
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                placeholder="m@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </Field>
          </View>

          <Button className="w-full" disabled={isSubmitting || !!success} onPress={onSubmit}>
            {isSubmitting ? (
              <ActivityIndicator size="small" className="text-primary-foreground" />
            ) : (
              <Text>Send reset code</Text>
            )}
          </Button>

          <Link href="/(auth)/sign-in" asChild>
            <Button variant="outline" className="w-full">
              <Text>Back to sign in</Text>
            </Button>
          </Link>
        </FieldGroup>
      </View>
    </ScrollView>
  );
}
