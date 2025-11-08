import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Link, router } from 'expo-router';

export default function SignInScreen() {
  const [email, setEmail] = React.useState('test@example.com');
  const [password, setPassword] = React.useState('password');
  const passwordInputRef = React.useRef<TextInput>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit() {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual sign in logic here later (e.g., using better-auth)
      console.log('Attempting sign in with:', email, password);

      // Mock delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      router.replace('/(app)/home');
    } catch (error) {
      // TODO: Show error toast
      console.error('Sign in error:', error);
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
