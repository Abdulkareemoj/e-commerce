import { useState, useEffect, useCallback } from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import {
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { Tags, Plus, Edit3, Trash2, X, Check } from 'lucide-react-native';
import { api } from '@/lib/api';
import { useConfirmDialog } from '@/components/ConfirmDialog';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const { confirm } = useConfirmDialog();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.publicGet('/admin/categories');
      setCategories(res.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const createCategory = async () => {
    if (!newName.trim() || !newSlug.trim()) return;
    try {
      await api.publicPost('/admin/categories', { name: newName, slug: newSlug });
      setNewName('');
      setNewSlug('');
      setShowNew(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const updateCategory = async (id: string) => {
    try {
      await api.publicPut(`/admin/categories/${id}`, { name: editName, slug: editSlug });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCategory = (id: string) => {
    confirm({
      title: 'Delete Category',
      description: 'Are you sure you want to delete this category?',
      destructive: true,
      confirmText: 'Delete',
      onConfirm: async () => {
        await api.publicDelete(`/admin/categories/${id}`);
        fetchCategories();
      },
    });
  };

  return (
    <View className="bg-background flex-1">
      <View className="gap-4 p-4">
        <View className="flex-row items-center justify-between">
          <Text variant="h2" className="font-bold">
            Categories
          </Text>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onPress={() => setShowNew(!showNew)}>
            <Icon as={Plus} size={16} />
            <Text>Add</Text>
          </Button>
        </View>

        {showNew && (
          <View className="flex-row items-center gap-2">
            <Input
              value={newName}
              onChangeText={setNewName}
              placeholder="Name"
              className="flex-1"
            />
            <Input
              value={newSlug}
              onChangeText={(t) => setNewSlug(t.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="slug"
              className="flex-1"
            />
            <Button size="icon" variant="default" onPress={createCategory}>
              <Icon as={Check} size={16} />
            </Button>
            <Button size="icon" variant="ghost" onPress={() => setShowNew(false)}>
              <Icon as={X} size={16} />
            </Button>
          </View>
        )}
      </View>

      <ScrollView className="flex-1 px-4">
        {loading ? (
          <ActivityIndicator className="mt-8" />
        ) : categories.length === 0 ? (
          <Text className="text-muted-foreground mt-8 text-center">No categories yet</Text>
        ) : (
          <View className="gap-2 pb-4">
            {categories.map((c: any) => (
              <View key={c.id} className="bg-card rounded-lg border p-4">
                {editingId === c.id ? (
                  <View className="gap-2">
                    <View className="flex-row items-center gap-2">
                      <Input value={editName} onChangeText={setEditName} className="flex-1" />
                      <Input value={editSlug} onChangeText={setEditSlug} className="flex-1" />
                    </View>
                    <View className="flex-row gap-2">
                      <Button size="sm" variant="default" onPress={() => updateCategory(c.id)}>
                        <Text>Save</Text>
                      </Button>
                      <Button size="sm" variant="ghost" onPress={() => setEditingId(null)}>
                        <Text>Cancel</Text>
                      </Button>
                    </View>
                  </View>
                ) : (
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="font-semibold">{c.name}</Text>
                      <Text className="text-muted-foreground text-xs">/{c.slug}</Text>
                    </View>
                    <View className="flex-row gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onPress={() => {
                          setEditingId(c.id);
                          setEditName(c.name);
                          setEditSlug(c.slug);
                        }}>
                        <Icon as={Edit3} size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onPress={() => deleteCategory(c.id)}>
                        <Icon as={Trash2} size={14} className="text-red-500" />
                      </Button>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
