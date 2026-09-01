import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { NumberField } from '@/components/NumberField';
import { TextField } from '@/components/TextField';
import type { RoutineBlock } from '@/types/routine';

interface ExerciseBlockRowProps {
  block: RoutineBlock;
  exerciseName: string;
  isFirst: boolean;
  isLast: boolean;
  onChange: (block: RoutineBlock) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

/** Fila editable de un bloque de ejercicio dentro del editor de rutina. */
export function ExerciseBlockRow({
  block,
  exerciseName,
  isFirst,
  isLast,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: ExerciseBlockRowProps): React.JSX.Element {
  return (
    <View className="gap-3 rounded-2xl border border-line bg-surface-subtle p-4">
      <View className="flex-row items-start justify-between gap-2">
        <Text className="flex-1 text-sm font-bold text-ink">{exerciseName}</Text>
        <View className="flex-row items-center gap-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Subir ejercicio"
            disabled={isFirst}
            onPress={onMoveUp}
            className="h-8 w-8 items-center justify-center rounded-lg active:bg-surface-field"
          >
            <Ionicons name="chevron-up" size={18} color={isFirst ? '#CBD5E1' : '#334155'} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bajar ejercicio"
            disabled={isLast}
            onPress={onMoveDown}
            className="h-8 w-8 items-center justify-center rounded-lg active:bg-surface-field"
          >
            <Ionicons name="chevron-down" size={18} color={isLast ? '#CBD5E1' : '#334155'} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quitar ejercicio"
            onPress={onRemove}
            className="h-8 w-8 items-center justify-center rounded-lg active:bg-rose-50"
          >
            <Ionicons name="trash-outline" size={16} color="#E11D48" />
          </Pressable>
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <NumberField
            label="Series"
            value={block.sets}
            onChange={(value) => onChange({ ...block, sets: value ?? 0 })}
          />
        </View>
        <View className="flex-1">
          <NumberField
            label="Reps min"
            value={block.repsMin}
            onChange={(value) => onChange({ ...block, repsMin: value ?? 0 })}
          />
        </View>
        <View className="flex-1">
          <NumberField
            label="Reps max"
            value={block.repsMax}
            onChange={(value) => onChange({ ...block, repsMax: value ?? 0 })}
          />
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <TextField
            label="Carga sugerida"
            placeholder="20 kg"
            value={block.suggestedLoad}
            onChangeText={(value) => onChange({ ...block, suggestedLoad: value })}
          />
        </View>
        <View className="flex-1">
          <NumberField
            label="Descanso"
            suffix="seg"
            value={block.restSec}
            onChange={(value) => onChange({ ...block, restSec: value ?? 0 })}
          />
        </View>
      </View>
    </View>
  );
}
