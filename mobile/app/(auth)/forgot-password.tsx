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
import { router } from 'expo-router';
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

type ForgotData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordScreen() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const { control, handleSubmit } = useForm<ForgotData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = React.useCallback(async (data: ForgotData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await api.publicPost('/auth/forgot-password', { email: data.email });
      setSuccess('A password reset code has been sent to your email.');
      setTimeout(() => {
        router.push({ pathname: '/(auth)/reset-password', params: { email: data.email } });
      }, 2000);
    } catch (err: any) {
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
              <CardTitle className="text-center text-xl sm:text-left">Forgot password?</CardTitle>
              <CardDescription className="text-center sm:text-left">
                Enter your email to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-6">
              {error && (
                <Alert variant="destructive" icon={AlertCircle}>
                  <AlertTitle>Request Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert variant="default" icon={CheckCircle2}>
                  <AlertTitle>Request Sent</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
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
                <Button className="w-full" onPress={handleSubmit(onSubmit)} disabled={isSubmitting || !!success}>
                  <Text>Reset your password</Text>
                </Button>
              </FieldSet>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
