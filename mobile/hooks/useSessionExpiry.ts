import { useEffect, useState } from 'react';
import { sessionBus } from '@/lib/authStore';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

/**
 * Hook that listens for session expiry events and redirects to sign-in.
 * Use this in screens that require authentication.
 */
export function useSessionExpiry() {
  const router = useRouter();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const handleExpired = () => {
      setExpired(true);
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please sign in again.',
        [
          {
            text: 'Sign In',
            onPress: () => {
              router.replace('/(auth)/sign-in');
            },
          },
        ],
        { cancelable: false }
      );
    };

    sessionBus.on('expired', handleExpired);
    return () => {
      sessionBus.off('expired', handleExpired);
    };
  }, [router]);

  return { expired };
}
