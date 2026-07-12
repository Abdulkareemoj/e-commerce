import * as React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/lib/authStore';
import { Link, router } from 'expo-router';
import { AlertCircle, GalleryVerticalEnd } from 'lucide-react-native';
import { signIn, getSession } from '@/lib/auth-client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { navigateToDashboard } from '@/lib/auth-helpers';

export default function SignInScreen() {
  const [email, setEmail] = React.useState('test@example.com');
  const [password, setPassword] = React.useState('password');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = React.useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await signIn.email({ email, password });
      if (result?.error) throw new Error(result.error.message || 'Unable to sign in.');

      const { data: session } = await getSession();
      if (!session?.user) throw new Error('Signed in, but failed to load session.');

      useAuthStore.getState().setAuth(session.user as any);
      (await import('@/hooks/useCart')).useCart.getState().mergeGuestCart();

      const user = session.user as any;
      navigateToDashboard(user.role, user.vendorStatus);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password]);

  async function onSocialSignIn(provider: 'google' | 'apple') {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await (signIn as any).social({ provider, callbackURL: '/' });
      if (result?.error)
        throw new Error(result.error.message || `Unable to sign in with ${provider}.`);

      const { data: session } = await getSession();
      if (!session?.user) throw new Error('Signed in, but failed to load session.');

      useAuthStore.getState().setAuth(session.user as any);
      (await import('@/hooks/useCart')).useCart.getState().mergeGuestCart();

      const user = session.user as any;
      navigateToDashboard(user.role, user.vendorStatus);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

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
            <Text className="text-xl font-bold">Welcome back</Text>
            <FieldDescription>
              Don&apos;t have an account?{' '}
              <Link href="/(auth)/sign-up" asChild>
                <Pressable>
                  <Text className="text-primary font-medium underline underline-offset-4">
                    Sign up
                  </Text>
                </Pressable>
              </Link>
            </FieldDescription>
          </View>

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
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </Field>
          </View>

          <View className="flex flex-col gap-3">
            <Button className="w-full" disabled={isSubmitting} onPress={onSubmit}>
              {isSubmitting ? (
                <ActivityIndicator size="small" className="text-primary-foreground" />
              ) : (
                <Text>Login</Text>
              )}
            </Button>
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable>
                <Text className="text-primary mx-auto text-sm font-medium underline underline-offset-4">
                  Forgot your password?
                </Text>
              </Pressable>
            </Link>
          </View>

          <FieldSeparator>Or continue with</FieldSeparator>

          <View className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full"
              disabled={isSubmitting}
              onPress={() => onSocialSignIn('google')}>
              <SvgGoogle />
              <Text>Continue with Google</Text>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={isSubmitting}
              onPress={() => onSocialSignIn('apple')}>
              <SvgApple />
              <Text>Continue with Apple</Text>
            </Button>
          </View>

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

function SvgGoogle() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
        fill="currentColor"
      />
    </Svg>
  );
}

function SvgApple() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
        fill="currentColor"
      />
    </Svg>
  );
}
