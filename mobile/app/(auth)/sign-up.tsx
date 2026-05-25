import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pressable, ScrollView, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { FormInput } from '@/components/ui/form-input';
import { FieldSet } from '@/components/ui/field';
import { useAuthStore } from '@/lib/authStore';
import { router } from 'expo-router';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react-native';
import { signUp, getSession } from '@/lib/auth-client';

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignUpData = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { control, handleSubmit } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = React.useCallback(async (data: SignUpData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await signUp.email({ name: data.name, email: data.email, password: data.password });
      if (result?.error) {
        throw new Error(result.error.message || 'Unable to sign up.');
      }

      const { data: session } = await getSession();
      if (!session?.user) {
        throw new Error('Signed up, but failed to load session.');
      }

      useAuthStore.getState().setAuth(session.user as any);

      const role = (session.user as any)?.role;
      if (role === 'admin') {
        router.replace('/(admin)/(tabs)/dashboard');
      } else if (role === 'vendor') {
        router.replace('/(vendor)/(tabs)/dashboard');
      } else {
        router.replace('/(user)/(tabs)/home');
      }
    } catch (err: any) {
      console.error('Sign up error:', err.message);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
      keyboardDismissMode="interactive">
      <View className="w-full max-w-sm">
        <View className="gap-6">
          <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
            <CardHeader>
              <CardTitle className="text-center text-2xl sm:text-left">
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
              <FieldSet>
                <FormInput
                  control={control}
                  name="name"
                  label="Name"
                  placeholder="John Doe"
                  autoCapitalize="words"
                />
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
                <Button className="w-full" onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
                  <Text>{isSubmitting ? 'Creating Account...' : 'Continue'}</Text>
                </Button>
              </FieldSet>
              <View className="flex flex-row items-center justify-center gap-2 text-sm">
                <Text>Already have an account?</Text>
                <Pressable onPress={() => router.push('/(auth)/sign-in')}>
                  <Text className="text-sm underline underline-offset-4">Sign In</Text>
                </Pressable>
              </View>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
