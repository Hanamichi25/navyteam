import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { DraftSet } from '../logging';
import { SetCell, toNumber } from './SetRow';

interface ActiveSetRowProps {
  index: number;
  set: DraftSet;
  done: boolean;
  onChange: (patch: Partial<Omit<DraftSet, 'key'>>) => void;
  onToggleDone: () => void;
}

/** Fila de serie del entreno en curso: nº, reps, kg y check de "hecha". */
export function ActiveSetRow({
  index,
  set,
  done,
  onChange,
  onToggleDone,
}: ActiveSetRowProps): React.JSX.Element {
  return (
    <View className="flex-row items-center gap-2">
      <Text className="w-5 text-center text-sm font-bold text-ink-faint">{index + 1}</Text>
      <SetCell
        value={set.reps}
        onChangeText={(text) => onChange({ reps: toNumber(text) })}
        placeholder="reps"
        accessibilityLabel={`Serie ${index + 1}: repeticiones`}
      />
      <SetCell
        value={set.weightKg}
        onChangeText={(text) => onChange({ weightKg: toNumber(text) })}
        placeholder="kg"
        accessibilityLabel={`Serie ${index + 1}: peso en kg`}
      />
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={`Serie ${index + 1} hecha`}
        hitSlop={6}
        onPress={onToggleDone}
        className={`h-11 w-11 items-center justify-center rounded-xl border ${
          done ? 'border-emerald-500 bg-emerald-500' : 'border-line bg-surface'
        }`}
      >
        <Ionicons name="checkmark" size={18} color={done ? '#FFFFFF' : '#CBD5E1'} />
      </Pressable>
    </View>
  );
}
