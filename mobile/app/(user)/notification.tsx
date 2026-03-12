import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MessageSquare, Mail, Phone, Search } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/input';

// Mock FAQ Data
const MOCK_FAQ = [
  {
    id: 'faq-1',
    question: 'How do I track my order?',
    answer:
      'You can track your order by navigating to the "Orders" section in your profile and clicking the tracking link next to your order ID.',
  },
  {
    id: 'faq-2',
    question: 'What is your return policy?',
    answer:
      'We offer a 30-day return policy for all unused items. Please see the full policy in the Legal section of Settings.',
  },
  {
    id: 'faq-3',
    question: 'How do I change my shipping address?',
    answer:
      'You can update your saved addresses in the "Addresses" section of your profile. Note that the address cannot be changed after an order has shipped.',
  },
];

// --- Components ---

function ContactOption({
  title,
  description,
  icon,
  onPress,
}: {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Icon>['as'];
  onPress: () => void;
}) {
  return (
    <Button variant="outline" className="h-auto flex-col items-start p-4" onPress={onPress}>
      <View className="mb-1 flex-row items-center gap-3">
        <Icon as={icon} size={20} className="text-primary" />
        <Text variant="large" className="font-semibold">
          {title}
        </Text>
      </View>
      <Text className="text-left text-sm text-muted-foreground">{description}</Text>
    </Button>
  );
}

export default function SupportScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="border-b border-border p-4">
        <Text variant="h2" className="font-bold">
          Help & Support
        </Text>
      </View>
      <ScrollView contentContainerClassName="p-4 gap-6">
        {/* Search Bar */}
        <View className="flex-row items-center gap-2">
          <Icon as={Search} size={20} className="text-muted-foreground" />
          <Input placeholder="Search FAQ or articles..." className="flex-1" />
        </View>

        {/* Contact Options */}
        <View className="gap-3">
          <Text variant="large" className="font-semibold">
            Contact Us
          </Text>
          <ContactOption
            title="Live Chat"
            description="Start a conversation with our support team."
            icon={MessageSquare}
            onPress={() => console.log('Navigate to New Chat')}
          />
          <ContactOption
            title="Email Support"
            description="Send us an email and we'll respond within 24 hours."
            icon={Mail}
            onPress={() => console.log('Open Email Client')}
          />
          <ContactOption
            title="Call Us"
            description="Speak directly to a representative."
            icon={Phone}
            onPress={() => console.log('Initiate Phone Call')}
          />
        </View>

        {/* FAQ Section */}
        <View className="gap-3">
          <Text variant="large" className="font-semibold">
            Frequently Asked Questions
          </Text>
          <Accordion type="single" collapsible className="w-full">
            {MOCK_FAQ.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>
                  <Text className="font-medium">{item.question}</Text>
                </AccordionTrigger>
                <AccordionContent>
                  <Text className="text-muted-foreground">{item.answer}</Text>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
