import * as React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { api } from '@/lib/api';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { AlertCircle, GalleryVerticalEnd } from 'lucide-react-native';

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = React.useCallback(async () => {
    if (!email) {
      setError('Email is missing. Please go back to the forgot password screen.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!code.trim()) {
      setError('Verification code is required.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await api.publicPost('/auth/reset-password', { email, token: code, password });
      router.replace('/(auth)/sign-in');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, code]);

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
            <Text className="text-xl font-bold">Reset password</Text>
            <FieldDescription>
              Enter the code sent to your email and choose a new password.
            </FieldDescription>
          </View>

          {error && (
            <Alert variant="destructive" icon={AlertCircle}>
              <AlertTitle>Reset Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <View className="flex flex-col gap-4">
            <Field>
              <FieldLabel>Verification code</FieldLabel>
              <Input
                placeholder="000000"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
            </Field>
            <Field>
              <FieldLabel>New password</FieldLabel>
              <Input
                placeholder="At least 6 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </Field>
          </View>

          <Button className="w-full" disabled={isSubmitting} onPress={onSubmit}>
            {isSubmitting ? (
              <ActivityIndicator size="small" className="text-primary-foreground" />
            ) : (
              <Text>Reset password</Text>
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
