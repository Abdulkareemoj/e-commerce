import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MessageSquare, Mail, Phone, Search, ExternalLink } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Pressable, Linking, Alert } from 'react-native';

const FAQ = [
  {
    id: 'faq-1',
    question: 'How do I track my order?',
    answer:
      'You can track your order by navigating to the "Orders" section in your profile and clicking the tracking link next to your order ID.',
    tags: ['order', 'tracking', 'delivery'],
  },
  {
    id: 'faq-2',
    question: 'What is your return policy?',
    answer:
      'We offer a 30-day return policy for all unused items. Please see the full policy in the Legal section of Settings.',
    tags: ['return', 'refund', 'policy'],
  },
  {
    id: 'faq-3',
    question: 'How do I change my shipping address?',
    answer:
      'You can update your saved addresses in the "Addresses" section of your profile. Note that the address cannot be changed after an order has shipped.',
    tags: ['address', 'shipping', 'profile'],
  },
  {
    id: 'faq-4',
    question: 'How do I become a vendor?',
    answer:
      'Go to your profile settings and tap "Become a Vendor". Fill out the application form and our team will review it within 48 hours.',
    tags: ['vendor', 'sell', 'application'],
  },
  {
    id: 'faq-5',
    question: 'What payment methods are accepted?',
    answer:
      'We accept all major credit and debit cards, as well as PayPal and Apple Pay. You can manage your payment methods in your profile.',
    tags: ['payment', 'card', 'checkout'],
  },
  {
    id: 'faq-6',
    question: 'How do I contact a seller?',
    answer:
      'Open the product page and tap the "Chat with Seller" button to start a conversation directly with the vendor.',
    tags: ['seller', 'vendor', 'chat', 'message'],
  },
];

const CONTACT_EMAIL = 'support@marketplace.com';
const CONTACT_PHONE = '+1 (555) 123-4567';

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
    <Pressable onPress={onPress} className="active:opacity-70">
      <Card className="bg-card border-border rounded-2xl border">
        <CardContent className="flex-row items-center gap-4 p-4">
          <View className="bg-primary/10 size-12 items-center justify-center rounded-xl">
            <Icon as={icon} size={20} className="text-primary" />
          </View>
          <View className="flex-1">
            <Text className="text-foreground font-semibold">{title}</Text>
            <Text className="text-muted-foreground text-sm">{description}</Text>
          </View>
          <Icon as={ExternalLink} size={14} className="text-muted-foreground" />
        </CardContent>
      </Card>
    </Pressable>
  );
}

export default function SupportScreen() {
  const [search, setSearch] = React.useState('');

  const filteredFAQ = React.useMemo(() => {
    if (!search.trim()) return FAQ;
    const q = search.toLowerCase();
    return FAQ.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.tags.some((t) => t.includes(q))
    );
  }, [search]);

  const openLiveChat = async () => {
    const url = 'https://marketplace.com/support/chat';
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert(
        'Live Chat',
        'Live chat is available on our website at marketplace.com/support/chat'
      );
    }
  };

  const openEmail = async () => {
    const url = `mailto:${CONTACT_EMAIL}?subject=Support Request`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert('Email Support', `Send us an email at ${CONTACT_EMAIL}`);
    }
  };

  const openPhone = async () => {
    const url = `tel:${CONTACT_PHONE.replace(/\D/g, '')}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert('Call Us', `Call us at ${CONTACT_PHONE}`);
    }
  };

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
            value={search}
            onChangeText={setSearch}
            className="flex-1 border-0 bg-transparent"
          />
        </View>

        <View className="gap-3">
          <Text className="text-foreground text-lg font-bold">Contact Us</Text>
          <ContactOption
            title="Live Chat"
            description="Start a conversation with our support team"
            icon={MessageSquare}
            onPress={openLiveChat}
          />
          <ContactOption
            title="Email Support"
            description="Send us an email and we'll respond within 24 hours"
            icon={Mail}
            onPress={openEmail}
          />
          <ContactOption
            title="Call Us"
            description="Speak directly to a representative"
            icon={Phone}
            onPress={openPhone}
          />
        </View>

        <View className="gap-3">
          <Text className="text-foreground text-lg font-bold">Frequently Asked Questions</Text>
          {filteredFAQ.length === 0 ? (
            <Card className="bg-card border-border rounded-2xl border">
              <CardContent className="items-center justify-center py-8">
                <Icon as={Search} size={24} className="text-muted-foreground mb-2" />
                <Text className="text-muted-foreground text-center">No results for "{search}"</Text>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border rounded-2xl border">
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQ.map((item) => (
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
          )}
        </View>
      </ScrollView>
    </View>
  );
}
