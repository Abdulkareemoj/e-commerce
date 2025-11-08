import { Text } from '@/components/ui/text';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="border-b border-border p-4">
        <Text variant="h2" className="font-bold">
          Terms of Service
        </Text>
      </View>
      <ScrollView contentContainerClassName="p-4 gap-4">
        <Text className="text-sm text-muted-foreground">Effective Date: January 1, 2023</Text>

        <Text variant="h3" className="mt-2 font-bold">
          1. Acceptance of Terms
        </Text>
        <Text className="text-base text-muted-foreground">
          By accessing or using our service, you agree to be bound by these Terms of Service. If you
          disagree with any part of the terms, then you may not access the service.
        </Text>

        <Text variant="h3" className="mt-2 font-bold">
          2. User Accounts
        </Text>
        <Text className="text-base text-muted-foreground">
          When you create an account with us, you must provide information that is accurate,
          complete, and current at all times. Failure to do so constitutes a breach of the Terms,
          which may result in immediate termination of your account.
        </Text>

        <Text variant="h3" className="mt-2 font-bold">
          3. Purchases
        </Text>
        <Text className="text-base text-muted-foreground">
          If you wish to purchase any product or service made available through the service, you may
          be asked to supply certain information relevant to your purchase including, without
          limitation, your credit card number, the expiration date of your credit card, and your
          billing address.
        </Text>

        <Text className="mt-4 text-base text-muted-foreground">
          We reserve the right to refuse or cancel your order at any time for certain reasons
          including but not limited to product or service availability, errors in the description or
          price of the product or service, error in your order or other reasons.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
