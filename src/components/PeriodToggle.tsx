import { Pressable, Text, View } from 'react-native';

interface PeriodOption<T extends string> {
  value: T;
  label: string;
}

interface PeriodToggleProps<T extends string> {
  options: readonly PeriodOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Control segmentado compacto para elegir un periodo (Semana/Mes, Día/Semana/Mes...). */
export function PeriodToggle<T extends string>({
  options,
  value,
  onChange,
}: PeriodToggleProps<T>): React.JSX.Element {
  return (
    <View className="flex-row rounded-full bg-surface-field p-0.5">
      {options.map((option) => {
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
