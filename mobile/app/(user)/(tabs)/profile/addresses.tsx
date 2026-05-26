import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { FormInput } from '@/components/ui/form-input';
import { FieldSet, Field } from '@/components/ui/field';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
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

  const onSubmit = React.useCallback((data: AddressData) => {
    onSave({ ...data, type: address?.type || 'shipping', isDefault });
  }, [onSave, address, isDefault]);

  return (
    <FieldSet>
      <FormInput control={control} name="line1" label="Street Address" placeholder="123 Main St" />
      <FormInput control={control} name="line2" label="Apt / Suite (optional)" placeholder="Apt 4B" />
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
          <FormInput control={control} name="postalCode" label="Postal Code" placeholder="90210" keyboardType="number-pad" />
        </View>
        <View className="w-24">
          <FormInput control={control} name="country" label="Country" placeholder="US" />
        </View>
      </View>
      <Pressable
        onPress={() => setIsDefault(!isDefault)}
        className="flex-row items-center gap-2"
      >
        <View className={`size-5 rounded border items-center justify-center ${isDefault ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
          {isDefault && <Icon as={Check} size={14} className="text-primary-foreground" />}
        </View>
        <Text className="text-sm">Set as default address</Text>
      </Pressable>
      <View className="flex-row gap-3 pt-2">
        <Button variant="outline" className="flex-1" onPress={onCancel}><Text>Cancel</Text></Button>
        <Button className="flex-1" onPress={handleSubmit(onSubmit)}><Text>Save</Text></Button>
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

  React.useEffect(() => { fetchAddresses(); }, []);

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
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-border p-4">
        <Text variant="h2" className="font-bold">My Addresses</Text>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Icon as={Plus} size={16} /><Text>Add New</Text></Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-md">
            <DialogHeader><DialogTitle>{editingAddress ? 'Edit Address' : 'Add Address'}</DialogTitle></DialogHeader>
            <AddressForm
              key={editingAddress?.id || 'new'}
              address={editingAddress}
              onSave={handleSave}
              onCancel={() => { setDialogOpen(false); setEditingAddress(null); }}
            />
          </DialogContent>
        </Dialog>
      </View>

      <ScrollView contentContainerClassName="p-4 gap-4">
        {loading ? (
          <Text className="text-center text-muted-foreground mt-10">Loading addresses...</Text>
        ) : addresses.length === 0 ? (
          <View className="items-center mt-10 gap-3">
            <Text className="text-muted-foreground">No addresses yet.</Text>
            <Button variant="outline"><Icon as={Plus} size={16} /><Text>Add an Address</Text></Button>
          </View>
        ) : (
          addresses.map((addr) => (
            <Card key={addr.id} className="gap-3 border-2 border-border/50 p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-center gap-2 flex-1">
                  <Icon as={MapPin} size={20} className="text-primary" />
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-semibold capitalize">{addr.type}</Text>
                      {addr.isDefault && <Badge variant="default"><Text className="text-xs font-medium">Default</Text></Badge>}
                    </View>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <Button variant="ghost" size="icon" onPress={() => { setEditingAddress(addr); setDialogOpen(true); }}>
                    <Icon as={Edit} size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" onPress={() => handleDelete(addr.id)}>
                    <Icon as={Trash2} size={18} className="text-destructive" />
                  </Button>
                </View>
              </View>
              <Text className="text-sm text-muted-foreground">
                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}, {addr.country}
              </Text>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
