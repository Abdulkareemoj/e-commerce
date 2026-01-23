import { Text } from '@/components/ui/text';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="border-b border-border p-4">
        <Text variant="h2" className="font-bold">
          Privacy Policy
        </Text>
      </View>
      <ScrollView contentContainerClassName="p-4 gap-4">
        <Text className="text-sm text-muted-foreground">Last updated: October 26, 2023</Text>

        <Text variant="h3" className="mt-2 font-bold">
          1. Information We Collect
        </Text>
        <Text className="text-base text-muted-foreground">
          We collect information you provide directly to us, such as your name, email address,
          shipping address, and payment information when you make a purchase. We also collect data
          automatically, including device information and usage data.
        </Text>

        <Text variant="h3" className="mt-2 font-bold">
          2. How We Use Your Information
        </Text>
        <Text className="text-base text-muted-foreground">
          We use the information we collect to process transactions, manage your account,
          personalize your shopping experience, and communicate with you about products, services,
          and promotions.
        </Text>

        <Text variant="h3" className="mt-2 font-bold">
          3. Data Security
        </Text>
        <Text className="text-base text-muted-foreground">
          We implement a variety of security measures to maintain the safety of your personal
          information when you place an order or enter, submit, or access your personal information.
        </Text>

        <Text className="mt-4 text-base text-muted-foreground">
          For any questions regarding this policy, please contact us through the Support page.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
