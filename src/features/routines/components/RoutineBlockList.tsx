import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { COLORS } from '@/lib/colors';
import type { RoutineBlock } from '@/types/routine';

interface RoutineBlockListProps {
  blocks: RoutineBlock[];
  /** Nombre de cada ejercicio por su id (del catálogo de ejercicios). */
  exerciseNameById: Map<string, string>;
}

function repsLabel(block: RoutineBlock): string {
  return block.repsMin === block.repsMax
    ? `${block.repsMin} reps`
    : `${block.repsMin}–${block.repsMax} reps`;
}

/** Lista de solo lectura de los bloques de ejercicio de una rutina. */
export function RoutineBlockList({
  blocks,
  exerciseNameById,
}: RoutineBlockListProps): React.JSX.Element {
  return (
    <View className="gap-3">
      {blocks.map((block, index) => (
        <View
          key={block.id}
          className="gap-2 rounded-xl border border-line bg-surface-subtle p-4"
        >
          <View className="flex-row items-center gap-2">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-primary-light">
              <Text className="text-xs font-bold text-primary">{index + 1}</Text>
            </View>
            <Text className="flex-1 text-sm font-bold text-ink">
              {exerciseNameById.get(block.exerciseId) ?? 'Ejercicio'}
            </Text>
          </View>

          <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1 pl-8">
            <Text className="text-sm text-ink-muted">
              {block.sets} {block.sets === 1 ? 'serie' : 'series'} · {repsLabel(block)}
            </Text>
            {block.suggestedLoad ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="barbell-outline" size={13} color={COLORS.inkMuted} />
                <Text className="text-sm text-ink-muted">{block.suggestedLoad}</Text>
              </View>
            ) : null}
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={13} color={COLORS.inkMuted} />
              <Text className="text-sm text-ink-muted">{block.restSec} s descanso</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
