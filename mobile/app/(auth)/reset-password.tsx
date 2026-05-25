import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScrollView, View } from 'react-native';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { FormInput } from '@/components/ui/form-input';
import { FieldSet } from '@/components/ui/field';
import { api } from '@/lib/api';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';

const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  code: z.string().min(1, 'Verification code is required'),
});

type ResetData = z.infer<typeof resetSchema>;

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { control, handleSubmit } = useForm<ResetData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', code: '' },
  });

  const onSubmit = React.useCallback(async (data: ResetData) => {
    if (!email) {
      setError('Email is missing. Please go back to the forgot password screen.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await api.publicPost('/auth/reset-password', { email, token: data.code, password: data.password });
      router.replace('/(auth)/sign-in');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email]);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
      keyboardDismissMode="interactive">
      <View className="w-full max-w-sm">
        <View className="gap-6">
          <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
            <CardHeader>
              <CardTitle className="text-center text-xl sm:text-left">Reset password</CardTitle>
              <CardDescription className="text-center sm:text-left">
                Enter the code sent to your email and set a new password
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-6">
              {error && (
                <Alert variant="destructive" icon={AlertCircle}>
                  <AlertTitle>Reset Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <FieldSet>
                <FormInput
                  control={control}
                  name="password"
                  label="New password"
                  secureTextEntry
                />
                <FormInput
                  control={control}
                  name="code"
                  label="Verification code"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                />
                <Button className="w-full" onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
                  <Text>{isSubmitting ? 'Resetting...' : 'Reset Password'}</Text>
                </Button>
              </FieldSet>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
