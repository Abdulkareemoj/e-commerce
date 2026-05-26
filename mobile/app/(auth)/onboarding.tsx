import React, { useState, useRef } from 'react';
import { View, ScrollView, Pressable, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  Star,
  BarChart3,
  CheckCircle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react-native';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Slide data

const USER_SLIDES = [
  {
    icon: Search,
    title: 'Discover products',
    body: 'Browse thousands of products from verified vendors, filtered by category, price, and ratings.',
    accent: '#fbbf24',
  },
  {
    icon: Heart,
    title: 'Save your favorites',
    body: 'Wishlist items you love and get notified when prices drop or stock runs low.',
    accent: '#f87171',
  },
  {
    icon: ShoppingBag,
    title: 'Track every order',
    body: 'Real-time order status from purchase to doorstep, with in-app messaging to sellers.',
    accent: '#34d399',
  },
];

const VENDOR_SLIDES = [
  {
    icon: Package,
    title: 'List your products',
    body: 'Upload products with variants, images, and stock levels in minutes. We handle the storefront.',
    accent: '#fbbf24',
  },
  {
    icon: TrendingUp,
    title: 'Grow your sales',
    body: 'Analytics dashboards show you whats selling, where traffic comes from, and how to optimise.',
    accent: '#a78bfa',
  },
  {
    icon: DollarSign,
    title: 'Get paid fast',
    body: 'Automatic payouts after order completion. Track every transaction in your payout dashboard.',
    accent: '#34d399',
  },
];

// ─── Step 1: Role Select ──────────────────────────────────────────────────────

function RoleSelect({ onSelect }: { onSelect: (role: 'user' | 'vendor') => void }) {
  return (
    <View className="flex-1 px-6 pt-10 pb-8">
      <View className="mb-12">
        <Text className="mb-2 text-3xl font-bold tracking-tight text-white">Welcome aboard 👋</Text>
        <Text className="text-base leading-relaxed text-zinc-400">
          How are you planning to use the marketplace?
        </Text>
      </View>

      <View className="flex-1 gap-4">
        <Pressable
          onPress={() => onSelect('user')}
          className="flex-row items-center gap-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 active:opacity-75">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15">
            <Icon as={ShoppingBag} size={28} color="#fbbf24" />
          </View>
          <View className="flex-1">
            <Text className="mb-0.5 text-lg font-semibold text-white">I want to shop</Text>
            <Text className="text-sm leading-snug text-zinc-500">
              Browse products, save favorites, and track orders.
            </Text>
          </View>
          <Icon as={ChevronRight} size={20} color="#52525b" />
        </Pressable>

        <Pressable
          onPress={() => onSelect('vendor')}
          className="flex-row items-center gap-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 active:opacity-75">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/15">
            <Icon as={Store} size={28} color="#a78bfa" />
          </View>
          <View className="flex-1">
            <Text className="mb-0.5 text-lg font-semibold text-white">I want to sell</Text>
            <Text className="text-sm leading-snug text-zinc-500">
              List products, manage orders, and get paid.
            </Text>
          </View>
          <Icon as={ChevronRight} size={20} color="#52525b" />
        </Pressable>
      </View>

      <Text className="mt-6 text-center text-xs text-zinc-600">
        You can change this later in your account settings.
      </Text>
    </View>
  );
}

// ─── Step 2: Feature Highlights Carousel ─────────────────────────────────────

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
    <View className="flex-1">
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
              className="mb-8 h-24 w-24 items-center justify-center rounded-3xl"
              style={{ backgroundColor: slide.accent + '20' }}>
              <Icon as={slide.icon} size={44} color={slide.accent} />
            </View>
            <Text className="mb-3 text-center text-2xl font-bold tracking-tight text-white">
              {slide.title}
            </Text>
            <Text className="text-center text-base leading-relaxed text-zinc-400">
              {slide.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View className="mb-8 flex-row items-center justify-center gap-2">
        {slides.map((_, i) => (
          <View
            key={i}
            className="rounded-full"
            style={{
              width: i === index ? 20 : 6,
              height: 6,
              backgroundColor: i === index ? '#fbbf24' : '#3f3f46',
            }}
          />
        ))}
      </View>

      {/* CTA */}
      <View className="px-6 pb-8">
        <Pressable
          onPress={goNext}
          disabled={loading}
          className="h-14 items-center justify-center rounded-2xl bg-amber-400 active:opacity-85">
          {loading ? (
            <ActivityIndicator color="#09090b" />
          ) : (
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-bold text-zinc-950">
                {isLast ? 'Get started' : 'Next'}
              </Text>
              {!loading && <Icon as={ArrowRight} size={18} color="#09090b" />}
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
    // Optimistically update role in store so rest of app knows
    updateUser({ role });
    // Persist to backend
    try {
      await api.patch('/user/role', { role });
    } catch {
      // Non-fatal — they can retry or we can pick it up on next session
    }
    setStep('slides');
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await api.patch('/user/onboarding', { onboardingComplete: true });
      updateUser({ onboardingComplete: true });

      if (selectedRole === 'vendor') {
        // Vendor needs to submit a store application before being approved
        router.replace('/(vendor)/pending');
      } else {
        router.replace('/(user)/(tabs)/home');
      }
    } catch {
      // Even on failure, push them through — onboarding is not a hard gate
      updateUser({ onboardingComplete: true });
      router.replace(selectedRole === 'vendor' ? '/(vendor)/pending' : '/(user)/(tabs)/home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      {step === 'role' ? (
        <RoleSelect onSelect={handleRoleSelect} />
      ) : (
        <FeatureSlides slides={slides} onFinish={handleFinish} loading={loading} />
      )}
    </SafeAreaView>
  );
}
