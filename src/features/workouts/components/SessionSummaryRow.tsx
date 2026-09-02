import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { monthDayShort } from '@/lib/date';
import type { WorkoutSessionSummary } from '@/types/workout';

interface SessionSummaryRowProps {
  summary: WorkoutSessionSummary;
  onPress: () => void;
  /** Muestra un badge de fecha (mes + día) a la izquierda (vista de cliente). */
  leadingDateBadge?: boolean;
}

/** Fila del historial de sesiones (perfil del entrenador y "Mis entrenos" del cliente). */
export function SessionSummaryRow({
  summary,
  onPress,
  leadingDateBadge = false,
}: SessionSummaryRowProps): React.JSX.Element {
  const badge = leadingDateBadge ? monthDayShort(summary.date) : null;
  const durationPart = summary.durationMin ? ` · ${summary.durationMin} min` : '';
  const detail = badge
    ? `${summary.exerciseCount} ejercicios · ${summary.setCount} series${durationPart}`
    : `${summary.date} · ${summary.exerciseCount} ejercicios · ${summary.setCount} series${durationPart}`;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface-subtle p-4 active:bg-surface-field"
    >
      {badge ? (
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary-light">
          <Text className="text-xs font-bold uppercase text-primary">{badge.month}</Text>
          <Text className="text-base font-extrabold text-primary">{badge.day}</Text>
        </View>
      ) : null}

      <View className="flex-1 gap-1">
        <Text className="text-sm font-bold text-ink">{summary.routineName}</Text>
        <Text className="text-xs text-ink-faint">{detail}</Text>
        <Text className="text-xs text-ink-muted">
          {summary.totalVolumeKg.toLocaleString('es-ES')} kg de volumen
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </Pressable>
  );
}
