import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { api } from '@/lib/api';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, TextInput, View } from 'react-native';

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const codeInputRef = React.useRef<TextInput>(null);

  function onPasswordSubmitEditing() {
    codeInputRef.current?.focus();
  }

  async function onSubmit() {
    if (!email) {
      setError('Email is missing. Please go back to the forgot password screen.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await api.publicPost('/auth/reset-password', {
        email,
        token: code,
        password,
      });
      // On success, navigate to the sign-in screen to log in with the new password.
      router.replace('/(auth)/sign-in');
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
              <View className="gap-6">
                <View className="gap-1.5">
                  <View className="flex-row items-center">
                    <Label htmlFor="password">New password</Label>
                  </View>
                  <Input
                    id="password"
                    secureTextEntry
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={onPasswordSubmitEditing}
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
                <View className="gap-1.5">
                  <Label htmlFor="code">Verification code</Label>
                  <Input
                    ref={codeInputRef}
                    id="code"
                    autoCapitalize="none"
                    returnKeyType="send"
                    keyboardType="numeric"
                    autoComplete="sms-otp"
                    textContentType="oneTimeCode"
                    onSubmitEditing={onSubmit}
                    value={code}
                    onChangeText={setCode}
                  />
                </View>
                <Button className="w-full" onPress={onSubmit} disabled={isSubmitting}>
                  <Text>Reset Password</Text>
                </Button>
              </View>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
