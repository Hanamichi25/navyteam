import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';

/** Serie en edición dentro del formulario de registro (campos vacíos = `null`). */
export interface DraftSet {
  key: string;
  reps: number | null;
  weightKg: number | null;
  rpe: number | null;
}

interface SetRowProps {
  index: number;
  set: DraftSet;
  onChange: (patch: Partial<Omit<DraftSet, 'key'>>) => void;
  onRemove: () => void;
  removable: boolean;
}

function toNumber(text: string): number | null {
  const digits = text.replace(/[^0-9]/g, '');
  return digits === '' ? null : Number(digits);
}

function Cell({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
}: {
  value: number | null;
  onChangeText: (text: string) => void;
  placeholder: string;
  accessibilityLabel: string;
}): React.JSX.Element {
  return (
    <TextInput
      accessibilityLabel={accessibilityLabel}
      className="h-11 flex-1 rounded-xl border border-line bg-surface-field px-2 text-center text-base text-ink"
      value={value === null ? '' : String(value)}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      keyboardType="numeric"
      maxLength={4}
    />
  );
}

/** Fila compacta de una serie: nº, reps, kg, RPE (opcional) y botón de quitar. */
export function SetRow({ index, set, onChange, onRemove, removable }: SetRowProps): React.JSX.Element {
  return (
    <View className="flex-row items-center gap-2">
      <Text className="w-5 text-center text-sm font-bold text-ink-faint">{index + 1}</Text>
      <Cell
        value={set.reps}
        onChangeText={(text) => onChange({ reps: toNumber(text) })}
        placeholder="reps"
        accessibilityLabel={`Serie ${index + 1}: repeticiones`}
      />
      <Cell
        value={set.weightKg}
        onChangeText={(text) => onChange({ weightKg: toNumber(text) })}
        placeholder="kg"
        accessibilityLabel={`Serie ${index + 1}: peso en kg`}
      />
      <Cell
        value={set.rpe}
        onChangeText={(text) => onChange({ rpe: toNumber(text) })}
        placeholder="RPE"
        accessibilityLabel={`Serie ${index + 1}: RPE`}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Quitar serie ${index + 1}`}
        hitSlop={8}
        disabled={!removable}
        onPress={onRemove}
        className="h-8 w-8 items-center justify-center rounded-lg active:bg-rose-50"
      >
        <Ionicons name="close" size={16} color={removable ? '#94A3B8' : '#E2E8F0'} />
      </Pressable>
    </View>
  );
}
