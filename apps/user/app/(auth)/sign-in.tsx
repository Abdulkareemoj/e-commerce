import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { authClient } from '@/lib/auth-client';

import { Link, router } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';

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
      await authClient.signIn.email({
        email,
        password,
      });

      router.replace('/(app)/(tabs)/home');
    } catch (error: any) {
      console.error('Sign in error:', error.message);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
      keyboardDismissMode="interactive">
      <View className="w-full max-w-sm">
        <View className="gap-6">
          <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
            <CardHeader>
              <CardTitle className="text-center text-xl sm:text-left">
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
              <Text className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <Pressable
                  onPress={() => {
                    router.push('/(auth)/sign-up');
                  }}>
                  <Text className="text-sm underline underline-offset-4">Sign up</Text>
                </Pressable>
              </Text>
              <View className="flex-row items-center">
                <Separator className="flex-1" />
                <Text className="px-4 text-sm text-muted-foreground">or</Text>
                <Separator className="flex-1" />
              </View>
              {/* <SocialConnections /> */}
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
