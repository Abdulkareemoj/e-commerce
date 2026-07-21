import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Trash2, CheckCircle2, AlertCircle, Shield } from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { api } from '@/lib/api';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export default function PaymentMethodsScreen() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saving, setSaving] = useState(false);
  const { confirm } = useConfirmDialog();
  const { toast } = useToast();

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.publicGet('/user/payment-methods');
      setMethods(res.methods || []);
    } catch (err) {
      console.error('Failed to load payment methods:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const addMethod = async () => {
    if (!cardNumber || !cardHolder || !expiry || !cvv) {
      toast({ title: 'Error', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await api.publicPost('/user/payment-methods', {
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardHolder,
        expiry,
        cvv,
      });
      setShowAddModal(false);
      resetForm();
      fetchMethods();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add payment method.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteMethod = async (id: string) => {
    confirm({
      title: 'Delete',
      description: 'Remove this payment method?',
      destructive: true,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await api.publicDelete(`/user/payment-methods/${id}`);
          fetchMethods();
        } catch (err) {
          toast({ title: 'Error', description: 'Failed to delete payment method.', variant: 'destructive' });
        }
      },
    });
  };

  const setDefault = async (id: string) => {
    try {
      await api.publicPut(`/user/payment-methods/${id}/default`, {});
      fetchMethods();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update default.', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setCardNumber('');
    setCardHolder('');
    setExpiry('');
    setCvv('');
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  const brandIcon = (brand: string) => {
    const colors: Record<string, string> = {
      visa: 'text-blue-500',
      mastercard: 'text-orange-500',
      amex: 'text-indigo-500',
      discover: 'text-amber-500',
    };
    return colors[brand.toLowerCase()] || 'text-muted-foreground';
  };

  return (
    <View className="bg-background flex-1">
      <View className="bg-card border-border items-center justify-center border-b px-5 py-4">
        <Text className="text-foreground text-lg font-bold">Payment Methods</Text>
      </View>

      {loading ? (
        <ActivityIndicator className="mt-8" />
      ) : (
        <ScrollView contentContainerClassName="p-4 gap-4">
          {methods.length === 0 ? (
            <View className="flex-1 items-center justify-center gap-4 py-12">
              <View className="bg-primary/10 size-16 items-center justify-center rounded-full">
                <Icon as={CreditCard} size={32} className="text-primary" />
              </View>
              <Text className="text-foreground text-lg font-bold">No payment methods</Text>
              <Text className="text-muted-foreground text-center">
                Add a card to make checkout faster.
              </Text>
            </View>
          ) : (
            methods.map((m) => (
              <Card key={m.id} className="bg-card border-border rounded-2xl border">
                <CardContent className="flex-row items-center gap-4 p-4">
                  <View className="bg-muted size-12 items-center justify-center rounded-xl">
                    <Icon as={CreditCard} size={20} className={brandIcon(m.brand)} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-foreground font-semibold">
                        {m.brand.toUpperCase()} •••• {m.last4}
                      </Text>
                      {m.isDefault && (
                        <Badge className="bg-primary/20">
                          <Text className="text-primary text-xs">Default</Text>
                        </Badge>
                      )}
                    </View>
                    <Text className="text-muted-foreground text-sm">
                      Expires {m.expiryMonth}/{m.expiryYear}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    {!m.isDefault && (
                      <Pressable
                        onPress={() => setDefault(m.id)}
                        className="bg-primary/10 size-9 items-center justify-center rounded-full">
                        <Icon as={CheckCircle2} size={16} className="text-primary" />
                      </Pressable>
                    )}
                    <Pressable
                      onPress={() => deleteMethod(m.id)}
                      className="size-9 items-center justify-center rounded-full bg-red-500/10">
                      <Icon as={Trash2} size={16} className="text-red-500" />
                    </Pressable>
                  </View>
                </CardContent>
              </Card>
            ))
          )}

          <Button variant="outline" onPress={() => setShowAddModal(true)} className="mt-2">
            <Icon as={Plus} size={16} />
            <Text>Add Payment Method</Text>
          </Button>

          <View className="mt-4 flex-row items-center gap-2 self-center">
            <Icon as={Shield} size={14} className="text-muted-foreground" />
            <Text className="text-muted-foreground text-xs">
              Your payment info is encrypted and secure
            </Text>
          </View>
        </ScrollView>
      )}

      <Modal visible={showAddModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/50">
          <View className="bg-card gap-5 rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground text-lg font-bold">Add Card</Text>
              <Pressable
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}>
                <Text className="text-primary text-sm font-semibold">Cancel</Text>
              </Pressable>
            </View>

            <View className="gap-4">
              <View className="gap-2">
                <Text className="text-foreground text-sm font-medium">Cardholder Name</Text>
                <Input
                  placeholder="John Doe"
                  value={cardHolder}
                  onChangeText={setCardHolder}
                  autoCapitalize="words"
                />
              </View>

              <View className="gap-2">
                <Text className="text-foreground text-sm font-medium">Card Number</Text>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChangeText={formatCardNumber}
                  keyboardType="number-pad"
                  maxLength={19}
                />
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1 gap-2">
                  <Text className="text-foreground text-sm font-medium">Expiry</Text>
                  <Input
                    placeholder="MM/YY"
                    value={expiry}
                    onChangeText={formatExpiry}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
                <View className="flex-1 gap-2">
                  <Text className="text-foreground text-sm font-medium">CVV</Text>
                  <Input
                    placeholder="123"
                    value={cvv}
                    onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))}
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={4}
                  />
                </View>
              </View>
            </View>

            <View className="bg-muted/50 flex-row items-center gap-2 rounded-xl p-3">
              <Icon as={AlertCircle} size={14} className="text-muted-foreground" />
              <Text className="text-muted-foreground flex-1 text-xs">
                Test mode — no real charges will be made.
              </Text>
            </View>

            <Button onPress={addMethod} disabled={saving}>
              <Text>{saving ? 'Adding...' : 'Add Payment Method'}</Text>
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
