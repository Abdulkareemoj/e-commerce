import { useState, useRef, useCallback } from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { View, ScrollView, Platform, Alert } from 'react-native';
import { cn } from '@/lib/utils';
import { Send, Paperclip, Smile, Mic, X, ImageIcon, Camera, FileText } from 'lucide-react-native';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import EmojiPickerModal, { emojiData } from '@hiraku-ai/react-native-emoji-picker';

export type PickedAsset = {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  source: 'document' | 'gallery' | 'camera';
};

interface MessageComposerProps {
  onSend: (text: string, assets?: PickedAsset[]) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

function AssetChip({ asset, onRemove }: { asset: PickedAsset; onRemove: () => void }) {
  const getIcon = (source: PickedAsset['source']) => {
    switch (source) {
      case 'document':
        return FileText;
      case 'gallery':
      case 'camera':
        return ImageIcon;
    }
  };

  return (
    <View className="border-border bg-muted/60 flex-row items-center gap-1.5 rounded-md border px-2 py-1">
      <Icon as={getIcon(asset.source)} size={12} className="text-muted-foreground" />
      <Text className="text-foreground max-w-[120px] text-xs" numberOfLines={1}>
        {asset.name}
      </Text>
      <Button size="icon" variant="ghost" className="ml-0.5 h-5 w-5 rounded-sm" onPress={onRemove}>
        <Icon as={X} size={12} className="text-muted-foreground" />
      </Button>
    </View>
  );
}

export function MessageComposer({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
  className,
}: MessageComposerProps) {
  const [text, setText] = useState('');
  const [assets, setAssets] = useState<PickedAsset[]>([]);
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const inputRef = useRef<React.ComponentRef<typeof Input>>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if ((!trimmed && assets.length === 0) || disabled) return;
    onSend(trimmed, assets.length > 0 ? assets : undefined);
    setText('');
    setAssets([]);
    inputRef.current?.focus();
  }, [text, assets, disabled, onSend]);

  const normalizeDocument = useCallback(
    (doc: DocumentPicker.DocumentPickerAsset): PickedAsset => ({
      uri: doc.uri,
      name: doc.name,
      mimeType: doc.mimeType ?? undefined,
      size: doc.size,
      source: 'document' as const,
    }),
    []
  );

  const normalizeImage = useCallback(
    (img: ImagePicker.ImagePickerAsset, source: 'gallery' | 'camera'): PickedAsset => ({
      uri: img.uri,
      name: img.fileName ?? `${source}_${Date.now()}.jpg`,
      mimeType: img.mimeType ?? 'image/jpeg',
      size: img.fileSize ?? undefined,
      width: img.width,
      height: img.height,
      source,
    }),
    []
  );

  const handlePickDocument = useCallback(async () => {
    try {
      setAttachOpen(false);
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setAssets((prev) => [...prev, ...result.assets!.map(normalizeDocument)]);
      }
    } catch (err) {
      console.error('Document picker error:', err);
    }
  }, [normalizeDocument]);

  const handlePickGallery = useCallback(async () => {
    try {
      setAttachOpen(false);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Allow access to your photo library to attach images.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setAssets((prev) => [...prev, ...result.assets!.map((a) => normalizeImage(a, 'gallery'))]);
      }
    } catch (err) {
      console.error('Image picker error:', err);
    }
  }, [normalizeImage]);

  const handleTakePhoto = useCallback(async () => {
    try {
      setAttachOpen(false);
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Allow camera access to take photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setAssets((prev) => [...prev, ...result.assets!.map((a) => normalizeImage(a, 'camera'))]);
      }
    } catch (err) {
      console.error('Camera error:', err);
    }
  }, [normalizeImage]);

  const removeAsset = useCallback((index: number) => {
    setAssets((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setText((prev) => prev + emoji);
    setEmojiVisible(false);
  }, []);

  const canSend = text.trim().length > 0 || assets.length > 0;

  return (
    <View className={cn('border-border/50 bg-background border-t', className)}>
      {assets.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 pt-3">
          <View className="flex-row gap-2">
            {assets.map((a, i) => (
              <AssetChip key={`${a.name}-${i}`} asset={a} onRemove={() => removeAsset(i)} />
            ))}
          </View>
        </ScrollView>
      )}

      <View className="flex-row items-center gap-2 px-4 py-3">
        <View className="relative flex-1 flex-row items-center">
          <Input
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            multiline
            className={cn(
              'h-11 flex-1 rounded-md pr-36 pl-4 text-sm leading-5',
              Platform.select({ native: 'placeholder:text-muted-foreground' })
            )}
            onSubmitEditing={handleSend}
          />

          <View className="absolute top-1/2 right-1.5 -translate-y-1/2 flex-row items-center gap-0.5">
            <Popover onOpenChange={setEmojiVisible}>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Icon as={Smile} size={16} className="text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0" sideOffset={6}>
                <EmojiPickerModal
                  visible={emojiVisible}
                  onClose={() => setEmojiVisible(false)}
                  onEmojiSelect={handleEmojiSelect}
                  columns={7}
                  showSearchBar
                  showHistoryTab
                  darkMode
                  emojis={emojiData}
                />
              </PopoverContent>
            </Popover>

            <Popover onOpenChange={setAttachOpen}>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Icon as={Paperclip} size={16} className="text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={6} className="w-44 p-1.5">
                <View className="gap-0.5">
                  <Button
                    variant="ghost"
                    className="h-10 justify-start gap-3 rounded-md px-3"
                    onPress={handlePickGallery}>
                    <Icon as={ImageIcon} size={18} className="text-muted-foreground" />
                    <Text>Photo Library</Text>
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-10 justify-start gap-3 rounded-md px-3"
                    onPress={handleTakePhoto}>
                    <Icon as={Camera} size={18} className="text-muted-foreground" />
                    <Text>Camera</Text>
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-10 justify-start gap-3 rounded-md px-3"
                    onPress={handlePickDocument}>
                    <Icon as={FileText} size={18} className="text-muted-foreground" />
                    <Text>Document</Text>
                  </Button>
                </View>
              </PopoverContent>
            </Popover>

            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Icon as={Mic} size={16} className="text-muted-foreground" />
            </Button>
          </View>
        </View>

        <Button
          variant="default"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-full"
          onPress={handleSend}
          disabled={!canSend || disabled}>
          <Icon as={Send} size={18} className="text-primary-foreground" />
        </Button>
      </View>
    </View>
  );
}
