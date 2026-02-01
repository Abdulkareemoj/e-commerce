import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import * as React from 'react';
import { Pressable, TextInput, View, ScrollView } from 'react-native';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react-native';

export default function SignUpScreen() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const passwordInputRef = React.useRef<TextInput>(null);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit() {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await api.publicPost('/auth/register', { name, email, password });
      console.log('Sign up successful:', response);
      useAuthStore.getState().setAuth(response.user, response.accessToken, response.refreshToken); // Update Zustand store
      router.replace('//(tabs)/dashboard');
    } catch (error: any) {
      console.error('Sign up error:', error.message);
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
                Create your account
              </CardTitle>
              <CardDescription className="text-center sm:text-left">
                Welcome! Please fill in the details to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-6">
              {error && (
                <Alert variant="destructive" icon={AlertCircle}>
                  <AlertTitle>Sign-up Failed</AlertTitle>
                  <AlertDescription>
                    {error.includes('unique constraint') ? 'This email is already in use.' : error}
                  </AlertDescription>
                </Alert>
              )}
              <View className="gap-6">
                <View className="gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    autoComplete="name"
                    autoCapitalize="words"
                    returnKeyType="next"
                    submitBehavior="submit"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
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
                  <Text>{isSubmitting ? 'Creating Account...' : 'Continue'}</Text>
                </Button>
              </View>
              <View className="flex flex-row items-center justify-center gap-2 text-sm">
                <Text>Already have an account?</Text>
                <Pressable
                  onPress={() => {
                    router.push('/(auth)/sign-in');
                  }}>
                  <Text className="text-sm underline underline-offset-4">Sign In</Text>
                </Pressable>
              </View>
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
