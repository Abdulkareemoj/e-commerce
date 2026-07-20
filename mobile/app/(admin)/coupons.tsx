import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { api } from '@/lib/api';
import {
  Tag, Plus, Pencil, Trash2, Percent, DollarSign, Calendar, Repeat, ShoppingCart, ArrowLeft,
} from 'lucide-react-native';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountPercent: string | null;
  discountAmount: string | null;
  minimumOrderAmount: string;
  maxUses: number;
  currentUses: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'No expiry';
  return new Date(dateStr).toLocaleDateString();
}

function DiscountDisplay({ coupon }: { coupon: Coupon }) {
  const isPercent = coupon.discountType === 'percentage';
  const value = parseFloat((isPercent ? coupon.discountPercent : coupon.discountAmount) || '0');
  return (
    <View className="flex-row items-center gap-1">
      <Icon as={isPercent ? Percent : DollarSign} size={14} className="text-primary" />
      <Text className="text-lg font-bold">
        {isPercent ? `${value}%` : `$${value.toFixed(2)}`}
      </Text>
      <Text className="text-muted-foreground text-xs">OFF</Text>
    </View>
  );
}

function CouponForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Coupon;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial;
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      code: initial?.code || '',
      description: initial?.description || '',
      discountType: initial?.discountType || 'percentage',
      discountPercent: initial?.discountPercent || '',
      discountAmount: initial?.discountAmount || '',
      minimumOrderAmount: initial?.minimumOrderAmount || '0',
      maxUses: initial?.maxUses?.toString() || '0',
      expiresAt: initial?.expiresAt ? initial.expiresAt.split('T')[0] : '',
      isActive: initial?.isActive ?? true,
    },
  });

  const discountType = useWatch({ control, name: 'discountType' });

  const onSubmit = useCallback(async (data: any) => {
    setSaving(true);
    try {
      const payload: any = {
        code: data.code,
        description: data.description || undefined,
        discountType: data.discountType,
        minimumOrderAmount: data.minimumOrderAmount || '0',
        maxUses: parseInt(data.maxUses) || 0,
        expiresAt: data.expiresAt || undefined,
        isActive: data.isActive,
      };
      if (data.discountType === 'percentage') {
        payload.discountPercent = data.discountPercent;
      } else {
        payload.discountAmount = data.discountAmount;
      }

      if (isEdit) {
        await api.put(`/admin/coupons/${initial.id}`, payload);
      } else {
        await api.post('/admin/coupons', payload);
      }
      onSave();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save coupon', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, [isEdit, initial, onSave]);

  return (
    <ScrollView contentContainerClassName="gap-5 p-4">
      <View className="flex-row items-center gap-3">
        <Pressable onPress={onCancel} className="active:opacity-70">
          <Icon as={ArrowLeft} size={20} className="text-foreground" />
        </Pressable>
        <Text variant="h2" className="font-bold">
          {isEdit ? 'Edit Coupon' : 'Create Coupon'}
        </Text>
      </View>

      <Controller
        control={control}
        name="code"
        rules={{ required: 'Code is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Field invalid={!!errors.code}>
            <FieldContent>
              <FieldLabel>Code</FieldLabel>
              <Input
                onBlur={onBlur}
                onChangeText={(t: string) => onChange(t.toUpperCase())}
                value={value}
                placeholder="SUMMER25"
                autoCapitalize="characters"
              />
              <FieldError errors={errors.code ? [errors.code] : []} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <Field>
            <FieldContent>
              <FieldLabel>Description</FieldLabel>
              <Input onBlur={onBlur} onChangeText={onChange} value={value} placeholder="25% off summer collection" />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="discountType"
        rules={{ required: 'Discount type is required' }}
        render={({ field: { onChange, value } }) => (
          <Field invalid={!!errors.discountType}>
            <FieldContent>
              <FieldLabel>Discount Type</FieldLabel>
              <Select value={value} onValueChange={(v: any) => onChange(v.value)}>
                <SelectTrigger size="default">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage" label="Percentage" />
                  <SelectItem value="fixed" label="Fixed Amount" />
                </SelectContent>
              </Select>
              <FieldError errors={errors.discountType ? [errors.discountType] : []} />
            </FieldContent>
          </Field>
        )}
      />

      {discountType === 'percentage' ? (
        <Controller
          control={control}
          name="discountPercent"
          rules={{
            required: 'Percent is required',
            pattern: { value: /^\d+(\.\d{0,2})?$/, message: 'Invalid percent' },
            validate: (v) => (parseFloat(v) > 0 && parseFloat(v) <= 100) || 'Must be between 0 and 100',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Field invalid={!!errors.discountPercent}>
              <FieldContent>
                <FieldLabel>Discount Percent</FieldLabel>
                <Input onBlur={onBlur} onChangeText={onChange} value={value} placeholder="25" keyboardType="decimal-pad" />
                <FieldError errors={errors.discountPercent ? [errors.discountPercent] : []} />
              </FieldContent>
            </Field>
          )}
        />
      ) : (
        <Controller
          control={control}
          name="discountAmount"
          rules={{
            required: 'Amount is required',
            pattern: { value: /^\d+(\.\d{0,2})?$/, message: 'Invalid amount' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Field invalid={!!errors.discountAmount}>
              <FieldContent>
                <FieldLabel>Discount Amount ($)</FieldLabel>
                <Input onBlur={onBlur} onChangeText={onChange} value={value} placeholder="5.00" keyboardType="decimal-pad" />
                <FieldError errors={errors.discountAmount ? [errors.discountAmount] : []} />
              </FieldContent>
            </Field>
          )}
        />
      )}

      <Controller
        control={control}
        name="minimumOrderAmount"
        rules={{ pattern: { value: /^\d+(\.\d{0,2})?$/, message: 'Invalid amount' } }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Field invalid={!!errors.minimumOrderAmount}>
            <FieldContent>
              <FieldLabel>Minimum Order Amount ($)</FieldLabel>
              <Input onBlur={onBlur} onChangeText={onChange} value={value} placeholder="0" keyboardType="decimal-pad" />
              <FieldError errors={errors.minimumOrderAmount ? [errors.minimumOrderAmount] : []} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="maxUses"
        render={({ field: { onChange, onBlur, value } }) => (
          <Field>
            <FieldContent>
              <FieldLabel>Max Uses (0 = unlimited)</FieldLabel>
              <Input onBlur={onBlur} onChangeText={onChange} value={value} placeholder="0" keyboardType="number-pad" />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="expiresAt"
        render={({ field: { onChange, onBlur, value } }) => (
          <Field>
            <FieldContent>
              <FieldLabel>Expires At</FieldLabel>
              <Input onBlur={onBlur} onChangeText={onChange} value={value} placeholder="YYYY-MM-DD (leave empty for no expiry)" autoCapitalize="none" />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="isActive"
        render={({ field: { onChange, value } }) => (
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel>Active</FieldLabel>
            </FieldContent>
            <Switch checked={value} onCheckedChange={onChange} />
          </Field>
        )}
      />

      <Button onPress={handleSubmit(onSubmit)} disabled={saving} className="mt-2">
        <Text>{saving ? 'Saving...' : isEdit ? 'Update Coupon' : 'Create Coupon'}</Text>
      </Button>
    </ScrollView>
  );
}

export default function CouponsScreen() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [creating, setCreating] = useState(false);
  const { confirm } = useConfirmDialog();
  const { toast } = useToast();

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(res.coupons || []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleToggleActive = useCallback(async (coupon: Coupon) => {
    try {
      await api.put(`/admin/coupons/${coupon.id}`, { isActive: !coupon.isActive });
      fetchCoupons();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update coupon', variant: 'destructive' });
    }
  }, [fetchCoupons, toast]);

  const handleDelete = useCallback((coupon: Coupon) => {
    confirm({
      title: 'Delete Coupon',
      description: `Are you sure you want to delete "${coupon.code}"?`,
      destructive: true,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/coupons/${coupon.id}`);
          fetchCoupons();
        } catch (err: any) {
          toast({ title: 'Error', description: err.message || 'Failed to delete coupon', variant: 'destructive' });
        }
      },
    });
  }, [fetchCoupons, confirm, toast]);

  if (creating || editing) {
    return (
      <View className="bg-background flex-1">
        <CouponForm
          initial={editing || undefined}
          onSave={() => { setCreating(false); setEditing(null); fetchCoupons(); }}
          onCancel={() => { setCreating(false); setEditing(null); }}
        />
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <ScrollView contentContainerClassName="p-4 gap-4">
        <View className="flex-row items-center justify-between">
          <Text variant="h2" className="font-bold">Coupons</Text>
          <Button onPress={() => setCreating(true)}>
            <Icon as={Plus} size={16} />
            <Text>Create</Text>
          </Button>
        </View>

        {loading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="small" className="text-primary" />
            <Text className="text-muted-foreground mt-2 text-sm">Loading coupons...</Text>
          </View>
        ) : coupons.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Icon as={Tag} size={40} className="text-muted-foreground" />
            <Text className="text-muted-foreground mt-3 text-sm">No coupons yet</Text>
            <Button variant="outline" onPress={() => setCreating(true)} className="mt-4">
              <Text>Create your first coupon</Text>
            </Button>
          </View>
        ) : (
          coupons.map((coupon) => (
            <View key={coupon.id} className="bg-card rounded-2xl border border-border p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 gap-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-mono text-lg font-bold tracking-wider">{coupon.code}</Text>
                    <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                      <Text className="text-xs">{coupon.isActive ? 'Active' : 'Inactive'}</Text>
                    </Badge>
                  </View>
                  {coupon.description && (
                    <Text className="text-muted-foreground text-sm">{coupon.description}</Text>
                  )}
                </View>
              </View>

              <View className="mt-3 flex-row flex-wrap gap-x-6 gap-y-2">
                <DiscountDisplay coupon={coupon} />
                <View className="flex-row items-center gap-1">
                  <Icon as={ShoppingCart} size={14} className="text-muted-foreground" />
                  <Text className="text-muted-foreground text-xs">
                    Min: ${parseFloat(coupon.minimumOrderAmount || '0').toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Icon as={Repeat} size={14} className="text-muted-foreground" />
                  <Text className="text-muted-foreground text-xs">
                    {coupon.currentUses}/{coupon.maxUses || '∞'}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Icon as={Calendar} size={14} className="text-muted-foreground" />
                  <Text className="text-muted-foreground text-xs">{formatDate(coupon.expiresAt)}</Text>
                </View>
              </View>

              <View className="mt-3 flex-row items-center gap-2 border-t border-border pt-3">
                <Switch checked={coupon.isActive} onCheckedChange={() => handleToggleActive(coupon)} />
                <Text className="text-muted-foreground text-xs flex-1">
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </Text>
                <Pressable
                  onPress={() => setEditing(coupon)}
                  className="active:bg-secondary/50 size-9 items-center justify-center rounded-lg">
                  <Icon as={Pencil} size={16} className="text-muted-foreground" />
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(coupon)}
                  className="active:bg-destructive/10 size-9 items-center justify-center rounded-lg">
                  <Icon as={Trash2} size={16} className="text-destructive" />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}