import { useState, useRef } from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react-native';
import { View, TextInput } from 'react-native';
import { cn } from '@/lib/utils';

interface MessageComposerProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function MessageComposer({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
  className,
}: MessageComposerProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    inputRef.current?.focus();
  };

  return (
    <View
      className={cn(
        'flex-row items-center gap-2 border-t border-border/50 bg-background px-4 py-3',
        className
      )}>
      <Input
        ref={inputRef}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        multiline
        className="flex-1 max-h-24 rounded-2xl bg-muted/50 px-4 py-2.5 text-sm leading-5"
        placeholderClassName="text-muted-foreground/60"
        onSubmitEditing={handleSend}
        blurOnSubmit
      />
      <Button
        variant="default"
        size="icon"
        className="size-10 shrink-0 rounded-full"
        onPress={handleSend}
        disabled={!text.trim() || disabled}>
        <Icon as={Send} size={18} className="text-primary-foreground" />
      </Button>
    </View>
  );
}
