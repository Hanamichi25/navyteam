import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { AssignedRoutine } from '@/types/client';

interface AssignedRoutineRowProps {
  routine: AssignedRoutine;
  onRemove?: () => void;
}

/** Fila de rutina asignada dentro del perfil de un cliente. */
export function AssignedRoutineRow({
  routine,
  onRemove,
}: AssignedRoutineRowProps): React.JSX.Element {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface-subtle p-3">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
        <Ionicons name="barbell-outline" size={18} color="#2563EB" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-ink">{routine.name}</Text>
        <Text className="text-xs font-semibold text-primary">{routine.schedule}</Text>
        <Text className="text-xs text-ink-faint">
          {routine.exerciseCount} ejercicios · {routine.durationMin} min
        </Text>
      </View>
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Desasignar rutina"
          hitSlop={8}
          onPress={onRemove}
          className="h-8 w-8 items-center justify-center rounded-lg active:bg-rose-50"
        >
          <Ionicons name="close" size={18} color="#94A3B8" />
        </Pressable>
      ) : null}
    </View>
  );
}
