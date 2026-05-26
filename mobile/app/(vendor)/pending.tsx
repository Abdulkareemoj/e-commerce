import React, { useEffect, useState, useCallback } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Clock, CheckCircle, XCircle, Store, LogOut, RefreshCw, Mail } from 'lucide-react-native';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';

type VendorStatus = 'pending' | 'approved' | 'rejected';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    iconColor: '#fbbf24',
    iconBg: 'rgba(251,191,36,0.12)',
    title: 'Application under review',
    body: 'Our team typically reviews vendor applications within 1–2 business days. Well notify you by email as soon as a decision is made.',
    badge: 'Under review',
    badgeColor: '#fbbf24',
    badgeBg: 'rgba(251,191,36,0.12)',
  },
  approved: {
    icon: CheckCircle,
    iconColor: '#34d399',
    iconBg: 'rgba(52,211,153,0.12)',
    title: 'Youre approved!',
    body: 'Your vendor account is active. Head to your dashboard to start listing products.',
    badge: 'Approved',
    badgeColor: '#34d399',
    badgeBg: 'rgba(52,211,153,0.12)',
  },
  rejected: {
    icon: XCircle,
    iconColor: '#f87171',
    iconBg: 'rgba(248,113,113,0.12)',
    title: 'Application not approved',
    body: 'Unfortunately your application wasnt approved at this time. You can still shop as a regular user, or contact support to appeal the decision.',
    badge: 'Not approved',
    badgeColor: '#f87171',
    badgeBg: 'rgba(248,113,113,0.12)',
  },
} as const;

// ─── Timeline step ────────────────────────────────────────────────────────────

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
          className="h-6 w-6 items-center justify-center rounded-full"
          style={{
            backgroundColor: done
              ? 'rgba(52,211,153,0.15)'
              : active
                ? 'rgba(251,191,36,0.15)'
                : 'rgba(63,63,70,0.5)',
          }}>
          {done ? (
            <Icon as={CheckCircle} size={14} color="#34d399" />
          ) : active ? (
            <View className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          ) : (
            <View className="h-2 w-2 rounded-full bg-zinc-600" />
          )}
        </View>
        {!last && (
          <View
            className="my-0.5 w-px flex-1"
            style={{ backgroundColor: done ? '#34d39940' : '#3f3f4640', minHeight: 18 }}
          />
        )}
      </View>
      <Text
        className="pb-4 text-sm"
        style={{ color: done ? '#34d399' : active ? '#fbbf24' : '#71717a' }}>
        {label}
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

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
      // Auto-redirect when approved
      if (newStatus === 'approved') {
        setTimeout(() => router.replace('/(vendor)/(tabs)/dashboard'), 1500);
      }
    } catch {
      // Silently fail — status stays as-is
    } finally {
      setChecking(false);
    }
  }, [updateUser, router]);

  // Poll every 30 s while screen is mounted and status is pending
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
    <SafeAreaView className="flex-1 bg-zinc-950">
      <View className="flex-1 px-6 pt-8 pb-6">
        {/* Header */}
        <View className="mb-10 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10">
              <Icon as={Store} size={18} color="#fbbf24" />
            </View>
            <Text className="text-base font-semibold text-white">Vendor Portal</Text>
          </View>
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center gap-1.5 active:opacity-70">
            <Icon as={LogOut} size={16} color="#71717a" />
            <Text className="text-sm text-zinc-500">Sign out</Text>
          </Pressable>
        </View>

        {/* Status card */}
        <View className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          {/* Icon + badge */}
          <View className="mb-5 flex-row items-center justify-between">
            <View
              className="h-16 w-16 items-center justify-center rounded-2xl"
              style={{ backgroundColor: config.iconBg }}>
              <Icon as={StatusIcon} size={32} color={config.iconColor} />
            </View>
            <View className="rounded-full px-3 py-1" style={{ backgroundColor: config.badgeBg }}>
              <Text className="text-xs font-semibold" style={{ color: config.badgeColor }}>
                {config.badge}
              </Text>
            </View>
          </View>

          <Text className="mb-2 text-xl font-bold text-white">{config.title}</Text>
          <Text className="text-sm leading-relaxed text-zinc-400">{config.body}</Text>

          {/* Email hint */}
          {status === 'pending' && user?.email && (
            <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-zinc-800 px-4 py-3">
              <Icon as={Mail} size={14} color="#71717a" />
              <Text className="flex-1 text-xs text-zinc-500" numberOfLines={1}>
                Decision sent to <Text className="text-zinc-300">{user.email}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Timeline */}
        <View className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 px-5 pt-5 pb-2">
          <Text className="mb-4 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
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

        {/* Actions */}
        <View className="mt-auto gap-3">
          {status === 'pending' && (
            <Pressable
              onPress={checkStatus}
              disabled={checking}
              className="h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-zinc-700 active:opacity-75">
              {checking ? (
                <ActivityIndicator size="small" color="#fbbf24" />
              ) : (
                <>
                  <Icon as={RefreshCw} size={16} color="#fbbf24" />
                  <Text className="text-sm font-semibold text-amber-400">Check status</Text>
                </>
              )}
            </Pressable>
          )}

          {lastChecked && status === 'pending' && (
            <Text className="text-center text-xs text-zinc-600">
              Last checked: {lastChecked.toLocaleTimeString()}
            </Text>
          )}

          {status === 'approved' && (
            <Pressable
              onPress={() => router.replace('/(vendor)/(tabs)/dashboard')}
              className="h-14 items-center justify-center rounded-2xl bg-amber-400 active:opacity-85">
              <Text className="text-base font-bold text-zinc-950">Go to dashboard</Text>
            </Pressable>
          )}

          {(status === 'pending' || status === 'rejected') && (
            <Pressable
              onPress={handleContinueAsUser}
              className="h-12 items-center justify-center rounded-2xl active:opacity-75">
              <Text className="text-sm text-zinc-500">Continue as a shopper instead</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
