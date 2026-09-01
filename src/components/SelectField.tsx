import { Pressable, Text, View } from 'react-native';

import type { ChipOption } from '@/components/ChipGroup';

interface SelectFieldProps<T extends string> {
  label: string;
  options: readonly ChipOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
}

/** Selección única en formato chip, con label + error a juego con `TextField`. */
export function SelectField<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: SelectFieldProps<T>): React.JSX.Element {
  const hasError = Boolean(error);

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-ink">{label}</Text>

      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => onChange(option.value)}
              className={[
                'rounded-full border px-4 py-2',
                isActive
                  ? 'border-primary bg-primary'
                  : 'border-line bg-surface active:bg-surface-subtle',
              ].join(' ')}
            >
              <Text
                className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-ink-muted'}`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {hasError ? <Text className="text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
