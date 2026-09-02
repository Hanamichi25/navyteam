import { Pressable, Text, View } from 'react-native';

import type { DashboardPeriod } from '@/types/dashboard';

interface PeriodToggleProps {
  value: DashboardPeriod;
  onChange: (value: DashboardPeriod) => void;
}

const OPTIONS: readonly { value: DashboardPeriod; label: string }[] = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
];

/** Control segmentado para elegir el periodo de las métricas del "Resumen". */
export function PeriodToggle({
  value,
  onChange,
}: PeriodToggleProps): React.JSX.Element {
  return (
    <View className="flex-row rounded-full bg-surface-field p-0.5">
      {OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.value)}
            className={`rounded-full px-3 py-1.5 ${isActive ? 'bg-surface' : ''}`}
          >
            <Text
              className={`text-xs font-semibold ${isActive ? 'text-ink' : 'text-ink-muted'}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
