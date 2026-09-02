import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { ExerciseTrainedSummary } from '@/types/workout';

interface TrainedExerciseRowProps {
  summary: ExerciseTrainedSummary;
  onPress: () => void;
}

/** Fila de "Progreso por ejercicio" en la pestaña "Entrenos" del perfil. */
export function TrainedExerciseRow({
  summary,
  onPress,
}: TrainedExerciseRowProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-4 active:bg-surface-subtle"
    >
      <View className="flex-1 gap-1">
        <Text className="text-sm font-bold text-ink">{summary.exerciseName}</Text>
        <Text className="text-xs text-ink-faint">
          {summary.sessionCount} {summary.sessionCount === 1 ? 'sesión' : 'sesiones'} · PR{' '}
          {summary.bestWeightKg} kg
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </Pressable>
  );
}
