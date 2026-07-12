import * as React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react-native';

function Pagination({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <View
      role="navigation"
      aria-label="pagination"
      className={cn('mx-auto flex w-full flex-row justify-center', className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <View className={cn('flex flex-row items-center gap-1', className)} {...props} />
  );
}

function PaginationItem({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn('', className)} {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
} & React.ComponentProps<typeof Pressable>;

function PaginationLink({
  className,
  isActive,
  size = 'icon',
  disabled,
  children,
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? 'outline' : 'ghost'}
      size={size}
      className={cn(className)}
      disabled={disabled}
      {...(props as any)}>
      {children}
    </Button>
  );
}

function PaginationPrevious({
  className,
  text = 'Previous',
  disabled,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      disabled={disabled}
      className={cn('gap-1 pl-2.5', className)}
      {...props}>
      <Icon as={ChevronLeft} size={16} />
      <Text className="hidden sm:block">{text}</Text>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  text = 'Next',
  disabled,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      disabled={disabled}
      className={cn('gap-1 pr-2.5', className)}
      {...props}>
      <Text className="hidden sm:block">{text}</Text>
      <Icon as={ChevronRight} size={16} />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <View
      aria-hidden
      className={cn('flex h-9 w-9 items-center justify-center', className)}
      {...props}>
      <Icon as={MoreHorizontal} size={16} className="text-muted-foreground" />
      <Text className="sr-only">More pages</Text>
    </View>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
