import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { type TextStyle, View, ScrollView } from 'react-native';

const RESEND_CODE_INTERVAL_SECONDS = 30;

const TABULAR_NUMBERS_STYLE: TextStyle = { fontVariant: ['tabular-nums'] };

function useCountdown(seconds = 30) {
  const [countdown, setCountdown] = React.useState(seconds);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = React.useCallback(() => {
    setCountdown(seconds);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startCountdown]);

  return { countdown, restartCountdown: startCountdown };
}

export default function VerifyEmailScreen() {
  const { countdown, restartCountdown } = useCountdown(RESEND_CODE_INTERVAL_SECONDS);

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
          <Card className="border-border/0 pb-4 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
            <CardHeader>
              <CardTitle className="text-center text-xl sm:text-left">Verify your email</CardTitle>
              <CardDescription className="text-center sm:text-left">
                Enter the verification code sent to m@example.com
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-6">
              <View className="gap-6">
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
                  <Button
                    variant="link"
                    size="sm"
                    disabled={countdown > 0}
                    onPress={() => {
                      // TODO: Resend code
                      restartCountdown();
                    }}>
                    <Text className="text-center text-xs">
                      Didn&apos;t receive the code? Resend{' '}
                      {countdown > 0 ? (
                        <Text className="text-xs" style={TABULAR_NUMBERS_STYLE}>
                          ({countdown})
                        </Text>
                      ) : null}
                    </Text>
                  </Button>
                </View>
                <View className="gap-3">
                  <Button className="w-full" onPress={onSubmit}>
                    <Text>Continue</Text>
                  </Button>
                  <Button
                    variant="link"
                    className="mx-auto"
                    onPress={() => {
                      // TODO: Navigate to sign up screen
                    }}>
                    <Text>Cancel</Text>
                  </Button>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
