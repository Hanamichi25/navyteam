import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { NumberField } from '@/components/NumberField';
import { TextField } from '@/components/TextField';
import { MUSCLE_GROUP_ICON, MUSCLE_GROUP_LABEL } from '@/features/exercises';
import { COLORS } from '@/lib/colors';
import type { Exercise } from '@/types/exercise';
import type { RoutineBlock } from '@/types/routine';

interface ExerciseBlockCardProps {
  block: RoutineBlock;
  index: number;
  /** `undefined` si el ejercicio ya no está en el catálogo. */
  exercise: Exercise | undefined;
  expanded: boolean;
  isFirst: boolean;
  isLast: boolean;
  onToggle: () => void;
  onChange: (block: RoutineBlock) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

function repsSummary(block: RoutineBlock): string {
  const reps =
    block.repsMin === block.repsMax
      ? `${block.repsMin}`
      : `${block.repsMin}–${block.repsMax}`;
  return `${block.sets} × ${reps}`;
}

/**
 * Bloque de ejercicio del editor de rutina: cabecera siempre visible (nº +
 * icono del grupo muscular + nombre + resumen) y campos editables al desplegar.
 */
export function ExerciseBlockCard({
  block,
  index,
  exercise,
  expanded,
  isFirst,
  isLast,
  onToggle,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: ExerciseBlockCardProps): React.JSX.Element {
  const name = exercise?.name ?? 'Ejercicio no encontrado';
  const iconName = exercise ? MUSCLE_GROUP_ICON[exercise.muscleGroup] : 'help-circle-outline';
  const subtitle = exercise
    ? MUSCLE_GROUP_LABEL[exercise.muscleGroup]
    : 'Ya no está en el catálogo';

  return (
    <View className="overflow-hidden rounded-2xl border border-line bg-surface">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${name}, ${repsSummary(block)}`}
        onPress={onToggle}
        className="flex-row items-center gap-3 p-3.5 active:bg-surface-subtle"
      >
        <View className="h-7 w-7 items-center justify-center rounded-full bg-primary">
          <Text className="text-xs font-bold text-white">{index + 1}</Text>
        </View>
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary-light">
          <Ionicons name={iconName} size={17} color={COLORS.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-ink" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-xs text-ink-faint">{subtitle}</Text>
        </View>
        {expanded ? null : (
          <Text className="text-xs font-semibold text-ink-muted">{repsSummary(block)}</Text>
        )}
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.inkFaint}
        />
      </Pressable>

      {expanded ? (
        <View className="gap-4 border-t border-line bg-surface-subtle p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Subir ejercicio"
                disabled={isFirst}
                onPress={onMoveUp}
                className="h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface active:bg-surface-field"
              >
                <Ionicons name="arrow-up" size={16} color={isFirst ? '#CBD5E1' : COLORS.ink} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Bajar ejercicio"
                disabled={isLast}
                onPress={onMoveDown}
                className="h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface active:bg-surface-field"
              >
                <Ionicons name="arrow-down" size={16} color={isLast ? '#CBD5E1' : COLORS.ink} />
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Quitar ejercicio"
              onPress={onRemove}
              className="flex-row items-center gap-1.5 rounded-lg px-2 py-1.5 active:bg-rose-50"
            >
              <Ionicons name="trash-outline" size={15} color="#E11D48" />
              <Text className="text-xs font-semibold text-rose-600">Quitar</Text>
            </Pressable>
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
                label="Descanso"
                suffix="seg"
                value={block.restSec}
                onChange={(value) => onChange({ ...block, restSec: value ?? 0 })}
              />
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-ink">Reps por serie</Text>
            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <NumberField
                  placeholder="8"
                  value={block.repsMin}
                  onChange={(value) => onChange({ ...block, repsMin: value ?? 0 })}
                />
              </View>
              <Text className="text-sm font-semibold text-ink-faint">a</Text>
              <View className="flex-1">
                <NumberField
                  placeholder="12"
                  value={block.repsMax}
                  onChange={(value) => onChange({ ...block, repsMax: value ?? 0 })}
                />
              </View>
            </View>
          </View>

          <TextField
            label="Carga sugerida"
            placeholder="20 kg · Peso corporal · RPE 8"
            value={block.suggestedLoad}
            onChangeText={(value) => onChange({ ...block, suggestedLoad: value })}
          />
        </View>
      ) : null}
    </View>
  );
}
