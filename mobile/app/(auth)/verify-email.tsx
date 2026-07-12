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
import { useAuthStore } from '@/lib/authStore';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { navigateToDashboard } from '@/lib/auth-helpers';

const RESEND_CODE_INTERVAL_SECONDS = 30;

const codeSchema = z.object({
  code: z.string().min(1, 'Verification code is required'),
});

type CodeData = z.infer<typeof codeSchema>;

function useCountdown(seconds = 30) {
  const [countdown, setCountdown] = React.useState(seconds);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = React.useCallback(() => {
    setCountdown(seconds);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [seconds]);

  React.useEffect(() => {
    startCountdown();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startCountdown]);

  return { countdown, restartCountdown: startCountdown };
}

export default function VerifyEmailScreen() {
  const { countdown, restartCountdown } = useCountdown(RESEND_CODE_INTERVAL_SECONDS);
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const { control, handleSubmit } = useForm<CodeData>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = React.useCallback(
    async (data: CodeData) => {
      if (!email) {
        setError('Email is missing from the request. Please try signing up again.');
        return;
      }
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        const response = await api.publicPost('/auth/verify-email', { email, token: data.code });
        useAuthStore.getState().setAuth(response.user);
        const user = response.user;
        navigateToDashboard(user.role, user.vendorStatus);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [email]
  );

  const onResend = React.useCallback(async () => {
    if (!email) {
      setError('Email is missing from the request. Please try signing up again.');
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await api.publicPost('/auth/resend-verification', { email });
      setSuccess('A new verification code has been sent.');
      restartCountdown();
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
    }
  }, [email, restartCountdown]);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
      keyboardDismissMode="interactive">
      <View className="w-full max-w-sm">
        <View className="gap-6">
          <Card className="border-border/0 sm:border-border pb-4 shadow-none sm:shadow-sm sm:shadow-black/5">
            <CardHeader>
              <CardTitle className="text-center text-xl sm:text-left">Verify your email</CardTitle>
              <CardDescription className="text-center sm:text-left">
                Enter the verification code sent to {email || 'your email'}
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-6">
              {error && (
                <Alert variant="destructive" icon={AlertCircle}>
                  <AlertTitle>Verification Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert variant="default" icon={CheckCircle2}>
                  <AlertTitle>Code Sent</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <FieldSet>
                <FormInput
                  control={control}
                  name="code"
                  label="Verification code"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                />
                <Button variant="link" size="sm" disabled={countdown > 0} onPress={onResend}>
                  <Text className="text-center text-xs">
                    Didn&apos;t receive the code? Resend {countdown > 0 ? `(${countdown})` : null}
                  </Text>
                </Button>
                <Button className="w-full" onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
                  <Text>{isSubmitting ? 'Verifying...' : 'Continue'}</Text>
                </Button>
                <Button variant="link" className="mx-auto" onPress={() => router.back()}>
                  <Text>Cancel</Text>
                </Button>
              </FieldSet>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
