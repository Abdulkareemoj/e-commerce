import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function onSubmit() {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await api.publicPost('/auth/forgot-password', { email });
      setSuccess('A password reset code has been sent to your email.');
      // Navigate to the reset password screen after a short delay
      setTimeout(() => {
        router.push({
          pathname: '/(auth)/reset-password',
          params: { email },
        });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
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
              <View className="gap-6">
                <View className="gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="m@example.com"
                    keyboardType="email-address"
                    autoComplete="email"
                    autoCapitalize="none"
                    returnKeyType="send"
                    onSubmitEditing={onSubmit}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
                <Button className="w-full" onPress={onSubmit} disabled={isSubmitting || !!success}>
                  <Text>Reset your password</Text>
                </Button>
              </View>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
