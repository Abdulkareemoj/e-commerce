import React, { useEffect, useState, useCallback } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Clock, CheckCircle, XCircle, Store, LogOut, RefreshCw, Mail } from 'lucide-react-native';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';

type VendorStatus = 'pending' | 'approved' | 'rejected';

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'Application under review',
    body: "Our team typically reviews vendor applications within 1–2 business days. We'll notify you by email as soon as a decision is made.",
    badge: 'Under review',
    badgeBg: 'bg-amber-100',
    badgeColor: 'text-amber-700',
  },
  approved: {
    icon: CheckCircle,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    title: "You're approved!",
    body: 'Your vendor account is active. Head to your dashboard to start listing products.',
    badge: 'Approved',
    badgeBg: 'bg-green-100',
    badgeColor: 'text-green-700',
  },
  rejected: {
    icon: XCircle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    title: 'Application not approved',
    body: "Unfortunately your application wasn't approved at this time. You can still shop as a regular user, or contact support to appeal the decision.",
    badge: 'Not approved',
    badgeBg: 'bg-red-100',
    badgeColor: 'text-red-700',
  },
} as const;

function TimelineStep({
  label,
  done,
  active,
  last,
}: {
  label: string;
  done: boolean;
  active: boolean;
  last?: boolean;
}) {
  return (
    <View className="flex-row gap-3">
      <View className="items-center">
        <View
          className={`h-6 w-6 items-center justify-center rounded-full ${
            done ? 'bg-green-100' : active ? 'bg-amber-100' : 'bg-secondary'
          }`}>
          {done ? (
            <Icon as={CheckCircle} size={14} className="text-green-600" />
          ) : active ? (
            <View className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          ) : (
            <View className="bg-muted-foreground h-2 w-2 rounded-full" />
          )}
        </View>
        {!last && (
          <View
            className="my-0.5 w-px flex-1"
            style={{ backgroundColor: done ? '#34d39940' : '#d4d4d840', minHeight: 18 }}
          />
        )}
      </View>
      <Text
        className={`pb-4 text-sm ${
          done ? 'text-green-600' : active ? 'text-amber-600' : 'text-muted-foreground'
        }`}>
        {label}
      </Text>
    </View>
  );
}

export default function VendorPendingScreen() {
  const router = useRouter();
  const { user, updateUser, clearAuth } = useAuthStore();
  const [status, setStatus] = useState<VendorStatus>(
    (user?.vendorStatus as VendorStatus) ?? 'pending'
  );
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const res = await api.get('/vendor/status');
      const newStatus: VendorStatus = res.status ?? 'pending';
      setStatus(newStatus);
      updateUser({ vendorStatus: newStatus });
      setLastChecked(new Date());
      if (newStatus === 'approved') {
        setTimeout(() => router.replace('/(vendor)/(tabs)/dashboard'), 1500);
      }
    } catch {
      // Silently fail
    } finally {
      setChecking(false);
    }
  }, [updateUser, router]);

  useEffect(() => {
    if (status !== 'pending') return;
    const id = setInterval(checkStatus, 30_000);
    return () => clearInterval(id);
  }, [status, checkStatus]);

  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  const handleLogout = async () => {
    await clearAuth();
    router.replace('/(auth)/sign-in');
  };

  const handleContinueAsUser = () => {
    updateUser({ role: 'user', vendorStatus: null });
    router.replace('/(user)/(tabs)/home');
  };

  return (
    <View className="bg-background flex-1">
      <View className="flex-1 px-6 pt-8 pb-6">
        <View className="mb-10 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <View className="bg-primary/10 h-9 w-9 items-center justify-center rounded-xl">
              <Icon as={Store} size={18} className="text-primary" />
            </View>
            <Text className="text-foreground text-base font-semibold">Vendor Portal</Text>
          </View>
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center gap-1.5 active:opacity-70">
            <Icon as={LogOut} size={16} className="text-muted-foreground" />
            <Text className="text-muted-foreground text-sm">Sign out</Text>
          </Pressable>
        </View>

        <View className="bg-card shadow-card mb-6 rounded-2xl p-6">
          <View className="mb-5 flex-row items-center justify-between">
            <View className={`${config.iconBg} h-16 w-16 items-center justify-center rounded-2xl`}>
              <Icon as={StatusIcon} size={32} className={config.iconColor} />
            </View>
            <View className={`${config.badgeBg} rounded-full px-3 py-1`}>
              <Text className={`${config.badgeColor} text-xs font-semibold`}>{config.badge}</Text>
            </View>
          </View>

          <Text className="text-foreground mb-2 text-xl font-bold">{config.title}</Text>
          <Text className="text-muted-foreground text-sm leading-relaxed">{config.body}</Text>

          {status === 'pending' && user?.email && (
            <View className="bg-secondary mt-4 flex-row items-center gap-2 rounded-xl px-4 py-3">
              <Icon as={Mail} size={14} className="text-muted-foreground" />
              <Text className="text-muted-foreground flex-1 text-xs" numberOfLines={1}>
                Decision sent to <Text className="text-foreground">{user.email}</Text>
              </Text>
            </View>
          )}
        </View>

        <View className="bg-card shadow-card mb-6 rounded-2xl px-5 pt-5 pb-2">
          <Text className="text-muted-foreground mb-4 text-xs font-semibold tracking-widest uppercase">
            Application progress
          </Text>
          <TimelineStep label="Account created" done={true} active={false} />
          <TimelineStep label="Application submitted" done={true} active={false} />
          <TimelineStep
            label="Under review"
            done={status === 'approved' || status === 'rejected'}
            active={status === 'pending'}
          />
          <TimelineStep
            label={
              status === 'rejected' ? 'Application not approved' : 'Approved — store activated'
            }
            done={status === 'approved'}
            active={false}
            last
          />
        </View>

        <View className="mt-auto gap-3">
          {status === 'pending' && (
            <Pressable
              onPress={checkStatus}
              disabled={checking}
              className="bg-secondary h-12 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-75">
              {checking ? (
                <ActivityIndicator size="small" className="text-primary" />
              ) : (
                <>
                  <Icon as={RefreshCw} size={16} className="text-primary" />
                  <Text className="text-primary text-sm font-semibold">Check status</Text>
                </>
              )}
            </Pressable>
          )}

          {lastChecked && status === 'pending' && (
            <Text className="text-muted-foreground text-center text-xs">
              Last checked: {lastChecked.toLocaleTimeString()}
            </Text>
          )}

          {status === 'approved' && (
            <Pressable
              onPress={() => router.replace('/(vendor)/(tabs)/dashboard')}
              className="bg-primary h-14 items-center justify-center rounded-2xl active:opacity-85">
              <Text className="text-primary-foreground text-base font-bold">Go to dashboard</Text>
            </Pressable>
          )}

          {(status === 'pending' || status === 'rejected') && (
            <Pressable
              onPress={handleContinueAsUser}
              className="h-12 items-center justify-center rounded-2xl active:opacity-75">
              <Text className="text-muted-foreground text-sm">Continue as a shopper instead</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
