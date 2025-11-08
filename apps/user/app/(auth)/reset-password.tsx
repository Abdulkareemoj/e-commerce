import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { TextInput, ScrollView, View } from 'react-native';

export default function ResetPasswordScreen() {
  const codeInputRef = React.useRef<TextInput>(null);

  function onPasswordSubmitEditing() {
    codeInputRef.current?.focus();
  }

  function onSubmit() {
    // TODO: Submit form and navigate to protected screen if successful
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
                  />
                </View>
                <View className="gap-1.5">
                  <Label htmlFor="code">Verification code</Label>
                  <Input
                    id="code"
                    autoCapitalize="none"
                    returnKeyType="send"
                    keyboardType="numeric"
                    autoComplete="sms-otp"
                    textContentType="oneTimeCode"
                    onSubmitEditing={onSubmit}
                  />
                </View>
                <Button className="w-full" onPress={onSubmit}>
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
