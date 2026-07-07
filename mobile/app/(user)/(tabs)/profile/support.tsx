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
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const FAQ = [
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
    <Card className="bg-card border-border rounded-2xl border" onTouchEnd={onPress}>
      <CardContent className="flex-row items-center gap-4 p-4">
        <View className="bg-primary/10 size-12 items-center justify-center rounded-xl">
          <Icon as={icon} size={20} className="text-primary" />
        </View>
        <View className="flex-1">
          <Text className="text-foreground font-semibold">{title}</Text>
          <Text className="text-muted-foreground text-sm">{description}</Text>
        </View>
      </CardContent>
    </Card>
  );
}

export default function SupportScreen() {
  return (
    <View className="bg-background flex-1">
      <View className="bg-card border-border items-center justify-center border-b px-5 py-4">
        <Text className="text-foreground text-lg font-bold">Help & Support</Text>
      </View>
      <ScrollView contentContainerClassName="p-4 gap-6">
        <View className="bg-card border-border flex-row items-center gap-3 rounded-2xl border px-4 py-3">
          <Icon as={Search} size={20} className="text-muted-foreground" />
          <Input
            placeholder="Search FAQ or articles..."
            className="flex-1 border-0 bg-transparent"
          />
        </View>

        <View className="gap-3">
          <Text className="text-foreground text-lg font-bold">Contact Us</Text>
          <ContactOption
            title="Live Chat"
            description="Start a conversation with our support team"
            icon={MessageSquare}
            onPress={() => console.log('Navigate to New Chat')}
          />
          <ContactOption
            title="Email Support"
            description="Send us an email and we'll respond within 24 hours"
            icon={Mail}
            onPress={() => console.log('Open Email Client')}
          />
          <ContactOption
            title="Call Us"
            description="Speak directly to a representative"
            icon={Phone}
            onPress={() => console.log('Initiate Phone Call')}
          />
        </View>

        <View className="gap-3">
          <Text className="text-foreground text-lg font-bold">Frequently Asked Questions</Text>
          <Card className="bg-card border-border rounded-2xl border">
            <Accordion type="single" collapsible className="w-full">
              {FAQ.map((item) => (
                <AccordionItem key={item.id} value={item.id} className="border-border px-4">
                  <AccordionTrigger>
                    <Text className="text-foreground font-medium">{item.question}</Text>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Text className="text-muted-foreground">{item.answer}</Text>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
