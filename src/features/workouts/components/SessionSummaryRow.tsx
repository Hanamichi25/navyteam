import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { WorkoutSessionSummary } from '@/types/workout';

interface SessionSummaryRowProps {
  summary: WorkoutSessionSummary;
  onPress: () => void;
}

/** Fila del historial de sesiones en la pestaña "Entrenos" del perfil. */
export function SessionSummaryRow({
  summary,
  onPress,
}: SessionSummaryRowProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface-subtle p-4 active:bg-surface-field"
    >
      <View className="flex-1 gap-1">
        <Text className="text-sm font-bold text-ink">{summary.routineName}</Text>
        <Text className="text-xs text-ink-faint">
          {summary.date} · {summary.exerciseCount} ejercicios · {summary.setCount} series
        </Text>
        <Text className="text-xs text-ink-muted">
          {summary.totalVolumeKg.toLocaleString('es-ES')} kg de volumen
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </Pressable>
  );
}
