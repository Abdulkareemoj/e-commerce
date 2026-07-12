import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { cn } from '@/lib/utils';
import { TextClassContext } from '@/components/ui/text';

const TableContext = React.createContext<{ horizontal: boolean }>({ horizontal: false });

function Table({
  className,
  horizontal = false,
  ...props
}: React.ComponentProps<typeof View> & { horizontal?: boolean }) {
  return (
    <TableContext.Provider value={{ horizontal }}>
      <View className={cn('border-border flex flex-col rounded-lg border', className)} {...props} />
    </TableContext.Provider>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <TextClassContext.Provider value="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      <View className={cn('bg-muted/30 border-border flex-row border-b', className)} {...props} />
    </TextClassContext.Provider>
  );
}

function TableBody({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn('', className)} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <TextClassContext.Provider value="text-sm text-foreground">
      <View
        className={cn('border-border/50 flex-row border-b last:border-b-0', className)}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

function TableHead({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View className={cn('min-w-[100px] flex-1 justify-center px-3 py-3', className)} {...props} />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View className={cn('min-w-[100px] flex-1 justify-center px-3 py-3', className)} {...props} />
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
