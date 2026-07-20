import { useState, useCallback } from 'react';
import { View, Pressable, Image, Alert, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { uploadFile } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, X, Camera, Loader2 } from 'lucide-react-native';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  onRemove?: () => void;
  previewUrl?: string;
  purpose?: 'product' | 'variant' | 'avatar' | 'general';
  compact?: boolean;
  className?: string;
}

export function ImageUpload({ onUpload, onRemove, previewUrl, purpose = 'product', compact, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const pickAndUpload = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Allow access to your photo library to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setUploading(true);

      const uri = asset.uri;
      const fileName = asset.fileName || `upload_${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';

      const publicUrl = await uploadFile(uri, fileName, mimeType, purpose);
      onUpload(publicUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      toast({ title: 'Upload Failed', description: 'Could not upload the image. Please try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }, [onUpload, purpose]);

  const pickFromCamera = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Allow camera access to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setUploading(true);

      const uri = asset.uri;
      const fileName = `camera_${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';

      const publicUrl = await uploadFile(uri, fileName, mimeType, purpose);
      onUpload(publicUrl);
    } catch (err) {
      console.error('Camera upload failed:', err);
      toast({ title: 'Upload Failed', description: 'Could not upload the photo. Please try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }, [onUpload, purpose]);

  if (previewUrl) {
    return (
      <View className={cn('relative', className)}>
        <Image
          source={{ uri: previewUrl }}
          className="h-24 w-24 rounded-xl"
          resizeMode="cover"
        />
        <Pressable
          onPress={onRemove}
          className="bg-destructive absolute -top-2 -right-2 rounded-full p-1">
          <Icon as={X} size={12} className="text-destructive-foreground" />
        </Pressable>
      </View>
    );
  }

  if (compact) {
    return (
      <Pressable
        onPress={pickAndUpload}
        disabled={uploading}
        className={cn('items-center justify-center', className)}>
        {uploading ? (
          <Icon as={Loader2} size={24} className="text-muted-foreground" />
        ) : (
          <Icon as={ImagePlus} size={24} className="text-muted-foreground" />
        )}
      </Pressable>
    );
  }

  return (
    <View className={cn('flex-row gap-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onPress={pickAndUpload}
        disabled={uploading}>
        {uploading ? (
          <Icon as={Loader2} size={14} className="text-muted-foreground" />
        ) : (
          <Icon as={ImagePlus} size={14} className="text-muted-foreground" />
        )}
        <Text>{uploading ? 'Uploading...' : 'Gallery'}</Text>
      </Button>
      {Platform.OS !== 'web' && (
        <Button
          variant="outline"
          size="sm"
          onPress={pickFromCamera}
          disabled={uploading}>
          <Icon as={Camera} size={14} className="text-muted-foreground" />
          <Text>Camera</Text>
        </Button>
      )}
    </View>
  );
}
