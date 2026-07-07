import React, { useState, useRef } from 'react';
import { View, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import {
  ShoppingBag,
  Store,
  Heart,
  Package,
  TrendingUp,
  DollarSign,
  Search,
  ArrowRight,
  ChevronRight,
} from 'lucide-react-native';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const USER_SLIDES = [
  {
    icon: Search,
    title: 'Discover products',
    body: 'Browse thousands of products from verified vendors, filtered by category, price, and ratings.',
    accent: '#8b5cf6',
  },
  {
    icon: Heart,
    title: 'Save your favorites',
    body: 'Wishlist items you love and get notified when prices drop or stock runs low.',
    accent: '#ec4899',
  },
  {
    icon: ShoppingBag,
    title: 'Track every order',
    body: 'Real-time order status from purchase to doorstep, with in-app messaging to sellers.',
    accent: '#10b981',
  },
];

const VENDOR_SLIDES = [
  {
    icon: Package,
    title: 'List your products',
    body: 'Upload products with variants, images, and stock levels in minutes. We handle the storefront.',
    accent: '#8b5cf6',
  },
  {
    icon: TrendingUp,
    title: 'Grow your sales',
    body: 'Analytics dashboards show you whats selling, where traffic comes from, and how to optimise.',
    accent: '#f59e0b',
  },
  {
    icon: DollarSign,
    title: 'Get paid fast',
    body: 'Automatic payouts after order completion. Track every transaction in your payout dashboard.',
    accent: '#10b981',
  },
];

function RoleSelect({ onSelect }: { onSelect: (role: 'user' | 'vendor') => void }) {
  return (
    <View className="bg-background flex-1 px-6 pt-10 pb-8">
      <View className="mb-12">
        <Text className="text-foreground mb-2 text-3xl font-bold tracking-tight">
          Welcome aboard
        </Text>
        <Text className="text-muted-foreground text-base leading-relaxed">
          How are you planning to use the marketplace?
        </Text>
      </View>

      <View className="flex-1 gap-4">
        <Pressable
          onPress={() => onSelect('user')}
          className="bg-card border-border flex-row items-center gap-5 rounded-2xl border p-6 active:opacity-75">
          <View className="bg-primary/10 h-14 w-14 items-center justify-center rounded-2xl">
            <Icon as={ShoppingBag} size={28} className="text-primary" />
          </View>
          <View className="flex-1">
            <Text className="text-foreground mb-0.5 text-lg font-semibold">I want to shop</Text>
            <Text className="text-muted-foreground text-sm leading-snug">
              Browse products, save favorites, and track orders.
            </Text>
          </View>
          <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
        </Pressable>

        <Pressable
          onPress={() => onSelect('vendor')}
          className="bg-card border-border flex-row items-center gap-5 rounded-2xl border p-6 active:opacity-75">
          <View className="bg-secondary h-14 w-14 items-center justify-center rounded-2xl">
            <Icon as={Store} size={28} className="text-secondary-foreground" />
          </View>
          <View className="flex-1">
            <Text className="text-foreground mb-0.5 text-lg font-semibold">I want to sell</Text>
            <Text className="text-muted-foreground text-sm leading-snug">
              List products, manage orders, and get paid.
            </Text>
          </View>
          <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
        </Pressable>
      </View>

      <Text className="text-muted-foreground mt-6 text-center text-xs">
        You can change this later in your account settings.
      </Text>
    </View>
  );
}

function FeatureSlides({
  slides,
  onFinish,
  loading,
}: {
  slides: typeof USER_SLIDES;
  onFinish: () => void;
  loading: boolean;
}) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const goNext = () => {
    if (index < slides.length - 1) {
      const next = index + 1;
      scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * next, animated: true });
      setIndex(next);
    } else {
      onFinish();
    }
  };

  const isLast = index === slides.length - 1;

  return (
    <View className="bg-background flex-1">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        className="flex-1">
        {slides.map((slide, i) => (
          <View
            key={i}
            style={{ width: SCREEN_WIDTH }}
            className="flex-1 items-center justify-center px-8">
            <View
              className="bg-primary/10 mb-8 h-24 w-24 items-center justify-center rounded-3xl"
              style={{ backgroundColor: slide.accent + '20' }}>
              <Icon as={slide.icon} size={44} color={slide.accent} />
            </View>
            <Text className="text-foreground mb-3 text-center text-2xl font-bold tracking-tight">
              {slide.title}
            </Text>
            <Text className="text-muted-foreground text-center text-base leading-relaxed">
              {slide.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View className="bg-card mb-8 flex-row items-center justify-center gap-2">
        {slides.map((_, i) => (
          <View
            key={i}
            className="rounded-full"
            style={{
              width: i === index ? 20 : 6,
              height: 6,
              backgroundColor: i === index ? slide.accent : 'hsl(var(--muted))',
            }}
          />
        ))}
      </View>

      <View className="px-6 pb-8">
        <Pressable
          onPress={goNext}
          disabled={loading}
          className="bg-primary h-14 items-center justify-center rounded-2xl active:opacity-85">
          {loading ? (
            <ActivityIndicator color="hsl(var(--primary-foreground))" />
          ) : (
            <View className="flex-row items-center gap-2">
              <Text className="text-primary-foreground text-base font-bold">
                {isLast ? 'Get started' : 'Next'}
              </Text>
              {!loading && <Icon as={ArrowRight} size={18} className="text-primary-foreground" />}
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

// ─── Root Onboarding Screen ───────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [step, setStep] = useState<'role' | 'slides'>('role');
  const [selectedRole, setSelectedRole] = useState<'user' | 'vendor' | null>(null);
  const [loading, setLoading] = useState(false);

  const slides = selectedRole === 'vendor' ? VENDOR_SLIDES : USER_SLIDES;

  const handleRoleSelect = async (role: 'user' | 'vendor') => {
    setSelectedRole(role);
    updateUser({ role });
    try {
      await api.patch('/user/role', { role });
    } catch {
      // Non-fatal
    }
    setStep('slides');
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await api.patch('/user/onboarding', { onboardingComplete: true });
      updateUser({ onboardingComplete: true });

      if (selectedRole === 'vendor') {
        router.replace('/(vendor)/pending');
      } else {
        router.replace('/(user)/(tabs)/home');
      }
    } catch {
      updateUser({ onboardingComplete: true });
      router.replace(selectedRole === 'vendor' ? '/(vendor)/pending' : '/(user)/(tabs)/home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-background flex-1">
      {step === 'role' ? (
        <RoleSelect onSelect={handleRoleSelect} />
      ) : (
        <FeatureSlides slides={slides} onFinish={handleFinish} loading={loading} />
      )}
    </View>
  );
}
