import { Pressable, ScrollView, Text } from 'react-native';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChipGroupProps<T extends string> {
  options: readonly ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Fila horizontal de filtros tipo "chip" (una sola selección). */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: ChipGroupProps<T>): React.JSX.Element {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-5"
    >
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
    </ScrollView>
  );
}
