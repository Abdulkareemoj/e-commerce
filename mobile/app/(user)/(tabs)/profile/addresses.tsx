import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScrollView, View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { FormInput } from '@/components/ui/form-input';
import { FieldSet, Field } from '@/components/ui/field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { MapPin, Edit, Trash2, Plus, Check } from 'lucide-react-native';

const addressSchema = z.object({
  line1: z.string().min(1, 'Street address is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

type AddressData = z.infer<typeof addressSchema>;

interface Address {
  id: string;
  type: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

function AddressForm({
  address,
  onSave,
  onCancel,
}: {
  address?: Address | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const { control, handleSubmit } = useForm<AddressData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      line1: address?.line1 || '',
      line2: address?.line2 || '',
      city: address?.city || '',
      state: address?.state || '',
      postalCode: address?.postalCode || '',
      country: address?.country || 'US',
    },
  });

  const [isDefault, setIsDefault] = React.useState(address?.isDefault || false);

  const onSubmit = React.useCallback(
    (data: AddressData) => {
      onSave({ ...data, type: address?.type || 'shipping', isDefault });
    },
    [onSave, address, isDefault]
  );

  return (
    <FieldSet>
      <FormInput control={control} name="line1" label="Street Address" placeholder="123 Main St" />
      <FormInput
        control={control}
        name="line2"
        label="Apt / Suite (optional)"
        placeholder="Apt 4B"
      />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormInput control={control} name="city" label="City" placeholder="Los Angeles" />
        </View>
        <View className="w-20">
          <FormInput control={control} name="state" label="State" placeholder="CA" />
        </View>
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormInput
            control={control}
            name="postalCode"
            label="Postal Code"
            placeholder="90210"
            keyboardType="number-pad"
          />
        </View>
        <View className="w-24">
          <FormInput control={control} name="country" label="Country" placeholder="US" />
        </View>
      </View>
      <Pressable onPress={() => setIsDefault(!isDefault)} className="flex-row items-center gap-2">
        <View
          className={`size-5 items-center justify-center rounded border ${isDefault ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
          {isDefault && <Icon as={Check} size={14} className="text-primary-foreground" />}
        </View>
        <Text className="text-sm">Set as default address</Text>
      </Pressable>
      <View className="flex-row gap-3 pt-2">
        <Button variant="outline" className="flex-1" onPress={onCancel}>
          <Text>Cancel</Text>
        </Button>
        <Button className="flex-1" onPress={handleSubmit(onSubmit)}>
          <Text>Save</Text>
        </Button>
      </View>
    </FieldSet>
  );
}

export default function AddressesScreen() {
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<Address | null>(null);

  async function fetchAddresses() {
    try {
      const res = await api.get('/addresses');
      setAddresses(res.addresses || []);
    } catch (err) {
      console.error('Failed to load addresses', err);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchAddresses();
  }, []);

  async function handleSave(form: any) {
    try {
      if (editingAddress) {
        await api.put(`/addresses/${editingAddress.id}`, form);
      } else {
        await api.post('/addresses', form);
      }
      setDialogOpen(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (err: any) {
      console.error('Failed to save address', err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/addresses/${id}`);
      fetchAddresses();
    } catch (err: any) {
      console.error('Failed to delete address', err);
    }
  }

  return (
    <View className="bg-background flex-1">
      <View className="bg-card border-border flex-row items-center justify-between border-b px-5 py-4">
        <Text className="text-foreground text-lg font-bold">My Addresses</Text>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl">
              <Icon as={Plus} size={16} className="text-primary-foreground" />
              <Text className="text-primary-foreground font-semibold">Add New</Text>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAddress ? 'Edit Address' : 'Add Address'}</DialogTitle>
            </DialogHeader>
            <AddressForm
              key={editingAddress?.id || 'new'}
              address={editingAddress}
              onSave={handleSave}
              onCancel={() => {
                setDialogOpen(false);
                setEditingAddress(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </View>

      <ScrollView contentContainerClassName="p-4 gap-4">
        {loading ? (
          <Text className="text-muted-foreground mt-10 text-center">Loading addresses...</Text>
        ) : addresses.length === 0 ? (
          <View className="mt-10 items-center gap-3">
            <Icon as={MapPin} size={48} className="text-muted-foreground" />
            <Text className="text-muted-foreground">No addresses yet</Text>
            <Button variant="outline" className="rounded-xl">
              <Icon as={Plus} size={16} />
              <Text>Add an Address</Text>
            </Button>
          </View>
        ) : (
          addresses.map((addr) => (
            <Card key={addr.id} className="bg-card border-border rounded-2xl border p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 flex-row items-center gap-3">
                  <View className="bg-primary/10 size-10 items-center justify-center rounded-xl">
                    <Icon as={MapPin} size={18} className="text-primary" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-foreground font-semibold capitalize">{addr.type}</Text>
                      {addr.isDefault && (
                        <View className="bg-primary/10 rounded-full px-2 py-0.5">
                          <Text className="text-primary text-[10px] font-semibold">Default</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-muted-foreground mt-1 text-sm">
                      {addr.line1}
                      {addr.line2 ? `, ${addr.line2}` : ''}
                    </Text>
                    <Text className="text-muted-foreground text-sm">
                      {addr.city}
                      {addr.state ? `, ${addr.state}` : ''} {addr.postalCode}, {addr.country}
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-xl"
                    onPress={() => {
                      setEditingAddress(addr);
                      setDialogOpen(true);
                    }}>
                    <Icon as={Edit} size={16} className="text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-xl"
                    onPress={() => handleDelete(addr.id)}>
                    <Icon as={Trash2} size={16} className="text-destructive" />
                  </Button>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}
