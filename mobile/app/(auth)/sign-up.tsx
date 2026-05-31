import * as React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/lib/authStore';
import { Link, router } from 'expo-router';
import { AlertCircle, GalleryVerticalEnd } from 'lucide-react-native';
import { signUp, getSession } from '@/lib/auth-client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SignUpScreen() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = React.useCallback(async () => {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await signUp.email({ name, email, password });
      if (result?.error) throw new Error(result.error.message || 'Unable to sign up.');

      const { data: session } = await getSession();
      if (!session?.user) throw new Error('Signed up, but failed to load session.');

      useAuthStore.getState().setAuth(session.user as any);

      const role = (session.user as any)?.role;
      if (role === 'admin') router.replace('/(admin)/(tabs)/dashboard');
      else if (role === 'vendor') router.replace('/(vendor)/(tabs)/dashboard');
      else router.replace('/(auth)/onboarding');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }, [name, email, password]);

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
            <Text className="text-xl font-bold">Create an account</Text>
            <FieldDescription>
              Already have an account?{' '}
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text className="text-primary font-medium underline underline-offset-4">
                    Sign in
                  </Text>
                </Pressable>
              </Link>
            </FieldDescription>
          </View>

          {error && (
            <Alert variant="destructive" icon={AlertCircle}>
              <AlertTitle>Sign-up Failed</AlertTitle>
              <AlertDescription>
                {error.includes('unique constraint') ? 'This email is already in use.' : error}
              </AlertDescription>
            </Alert>
          )}

          <View className="flex flex-col gap-4">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </Field>
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
            <Field>
              <FieldLabel>Password</FieldLabel>
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
              <Text>Create account</Text>
            )}
          </Button>

          <FieldDescription className="px-6 text-center">
            By clicking continue, you agree to our{' '}
            <Text className="text-primary font-medium underline underline-offset-4">
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text className="text-primary font-medium underline underline-offset-4">
              Privacy Policy
            </Text>
            .
          </FieldDescription>
        </FieldGroup>
      </View>
    </ScrollView>
  );
}
