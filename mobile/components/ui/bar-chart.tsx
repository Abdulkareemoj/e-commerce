import * as React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  className?: string;
}

export function BarChart({ data, height = 160, className }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View className={cn('gap-2', className)}>
      <View className="flex-row items-end gap-1.5" style={{ height }}>
        {data.map((item, index) => {
          const barHeight = Math.max((item.value / maxValue) * height, 4);
          return (
            <View key={index} className="flex-1 items-center gap-1">
              <Text className="text-muted-foreground text-[10px] font-medium">
                {item.value > 0
                  ? item.value >= 1000
                    ? `$${(item.value / 1000).toFixed(1)}k`
                    : `$${Math.round(item.value)}`
                  : ''}
              </Text>
              <View
                className={`w-full rounded-t-sm ${item.color || 'bg-primary'}`}
                style={{ height: barHeight }}
              />
              <Text className="text-muted-foreground text-[10px]">{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface HorizontalBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
}

export function HorizontalBar({ label, value, max, color = 'bg-primary' }: HorizontalBarProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <View className="gap-1.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-foreground text-sm">{label}</Text>
        <Text className="text-muted-foreground text-sm">{value}</Text>
      </View>
      <View className="bg-muted h-2 overflow-hidden rounded-full">
        <View
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </View>
    </View>
  );
}
