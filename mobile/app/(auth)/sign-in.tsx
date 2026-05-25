import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pressable, ScrollView, View } from 'react-native';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { FormInput } from '@/components/ui/form-input';
import { FieldSet } from '@/components/ui/field';
import { useAuthStore } from '@/lib/authStore';
import { Link, router } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { signIn, getSession } from '@/lib/auth-client';

const signInSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type SignInData = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { control, handleSubmit } = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: 'test@example.com', password: 'password' },
  });

  const onSubmit = React.useCallback(async (data: SignInData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await signIn.email({ email: data.email, password: data.password });
      if (result?.error) {
        throw new Error(result.error.message || 'Unable to sign in.');
      }

      const { data: session } = await getSession();
      if (!session?.user) {
        throw new Error('Signed in, but failed to load session.');
      }

      useAuthStore.getState().setAuth(session.user as any);

      (await import('@/hooks/useCart')).useCart.getState().mergeGuestCart();

      const role = (session.user as any)?.role;
      if (role === 'admin') {
        router.replace('/(admin)/(tabs)/dashboard');
      } else if (role === 'vendor') {
        router.replace('/(vendor)/(tabs)/dashboard');
      } else {
        router.replace('/(user)/(tabs)/home');
      }
    } catch (err: any) {
      console.error('Sign in error:', err.message);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  async function onSocialSignIn(provider: 'google' | 'apple') {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await (signIn as any).social({
        provider,
        callbackURL: '/',
      });

      if (result?.error) {
        throw new Error(result.error.message || `Unable to sign in with ${provider}.`);
      }

      const { data: session } = await getSession();
      if (!session?.user) {
        throw new Error('Signed in, but failed to load session.');
      }

      useAuthStore.getState().setAuth(session.user as any);

      (await import('@/hooks/useCart')).useCart.getState().mergeGuestCart();

      const role = (session.user as any)?.role;
      if (role === 'admin') {
        router.replace('/(admin)/(tabs)/dashboard');
      } else if (role === 'vendor') {
        router.replace('/(vendor)/(tabs)/dashboard');
      } else {
        router.replace('/(user)/(tabs)/home');
      }
    } catch (err: any) {
      console.error('Social sign in error:', err.message);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6"
      keyboardDismissMode="interactive">
      <View className="w-full max-w-sm">
        <View className="gap-6">
          <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
            <CardHeader>
              <CardTitle className="text-center text-2xl sm:text-left">
                Sign in to your app
              </CardTitle>
              <CardDescription className="text-center sm:text-left">
                Welcome back! Please sign in to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-6">
              {error && (
                <Alert variant="destructive" icon={AlertCircle}>
                  <AlertTitle>Sign-in Failed</AlertTitle>
                  <AlertDescription>
                    {error.includes('Invalid login credentials')
                      ? 'Incorrect email or password.'
                      : error}
                  </AlertDescription>
                </Alert>
              )}
              <FieldSet>
                <FormInput
                  control={control}
                  name="email"
                  label="Email"
                  placeholder="m@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <FormInput
                  control={control}
                  name="password"
                  label="Password"
                  secureTextEntry
                />
                <Link href="/(auth)/forgot-password" asChild>
                  <Button variant="link" size="sm" className="ml-auto h-4 px-1 py-0 web:h-fit sm:h-4">
                    <Text className="font-normal leading-4">Forgot your password?</Text>
                  </Button>
                </Link>
                <Button className="w-full" onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
                  <Text>{isSubmitting ? 'Signing In...' : 'Continue'}</Text>
                </Button>
              </FieldSet>
              <View className="flex flex-row items-center justify-center gap-2 text-sm">
                <Text>Don&apos;t have an account?</Text>
                <Pressable onPress={() => router.push('/(auth)/sign-up')}>
                  <Text className="text-sm underline underline-offset-4">Sign Up</Text>
                </Pressable>
              </View>
              <View className="flex-row items-center">
                <Separator className="flex-1" />
                <Text className="px-4 text-sm text-muted-foreground">or</Text>
                <Separator className="flex-1" />
              </View>
              <View className="gap-3">
                <Button variant="outline" className="w-full" disabled={isSubmitting} onPress={() => onSocialSignIn('google')}>
                  <Text>Continue with Google</Text>
                </Button>
                <Button variant="outline" className="w-full" disabled={isSubmitting} onPress={() => onSocialSignIn('apple')}>
                  <Text>Continue with Apple</Text>
                </Button>
              </View>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
