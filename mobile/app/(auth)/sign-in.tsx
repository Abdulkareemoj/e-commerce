import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/lib/authStore';
import { Link, router } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { signIn, getSession } from '@/lib/auth-client';

export default function SignInScreen() {
  const [email, setEmail] = React.useState('test@example.com');
  const [password, setPassword] = React.useState('password');
  const passwordInputRef = React.useRef<TextInput>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit() {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await signIn.email({ email, password });
      if (result?.error) {
        throw new Error(result.error.message || 'Unable to sign in.');
      }

      const { data } = await getSession();
      if (!data?.user) {
        throw new Error('Signed in, but failed to load session.');
      }

      useAuthStore.getState().setAuth(data.user as any);

      const role = (data.user as any)?.role;
      if (role === 'admin') {
        router.replace('/(admin)/(tabs)/dashboard');
      } else if (role === 'vendor') {
        router.replace('/(vendor)/(tabs)/dashboard');
      } else {
        router.replace('/(user)/(tabs)/home');
      }
    } catch (error: any) {
      console.error('Sign in error:', error.message);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

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

      const { data } = await getSession();
      if (!data?.user) {
        throw new Error('Signed in, but failed to load session.');
      }

      useAuthStore.getState().setAuth(data.user as any);

      const role = (data.user as any)?.role;
      if (role === 'admin') {
        router.replace('/(admin)/(tabs)/dashboard');
      } else if (role === 'vendor') {
        router.replace('/(vendor)/(tabs)/dashboard');
      } else {
        router.replace('/(user)/(tabs)/home');
      }
    } catch (error: any) {
      console.error('Social sign in error:', error.message);
      setError(error.message || 'An unexpected error occurred. Please try again.');
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
              <View className="gap-6">
                <View className="gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="m@example.com"
                    keyboardType="email-address"
                    autoComplete="email"
                    autoCapitalize="none"
                    onSubmitEditing={onEmailSubmitEditing}
                    returnKeyType="next"
                    submitBehavior="submit"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
                <View className="gap-1.5">
                  <View className="flex-row items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/(auth)/forgot-password" asChild>
                      <Button
                        variant="link"
                        size="sm"
                        className="ml-auto h-4 px-1 py-0 web:h-fit sm:h-4">
                        <Text className="font-normal leading-4">Forgot your password?</Text>
                      </Button>
                    </Link>
                  </View>
                  <Input
                    ref={passwordInputRef}
                    id="password"
                    secureTextEntry
                    returnKeyType="send"
                    onSubmitEditing={onSubmit}
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
                <Button className="w-full" onPress={onSubmit} disabled={isSubmitting}>
                  <Text>{isSubmitting ? 'Signing In...' : 'Continue'}</Text>
                </Button>
              </View>
              <View className="flex flex-row items-center justify-center gap-2 text-sm">
                <Text>Don&apos;t have an account?</Text>
                <Pressable
                  onPress={() => {
                    router.push('/(auth)/sign-up');
                  }}>
                  <Text className="text-sm underline underline-offset-4">Sign Up</Text>
                </Pressable>
              </View>
              <View className="flex-row items-center">
                <Separator className="flex-1" />
                <Text className="px-4 text-sm text-muted-foreground">or</Text>
                <Separator className="flex-1" />
              </View>

              <View className="gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isSubmitting}
                  onPress={() => onSocialSignIn('google')}>
                  <Text>Continue with Google</Text>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isSubmitting}
                  onPress={() => onSocialSignIn('apple')}>
                  <View className="flex-row items-center gap-2">
                    <Text>Continue with Apple</Text>
                  </View>
                </Button>
              </View>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
