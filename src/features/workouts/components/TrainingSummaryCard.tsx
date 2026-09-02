import { ActivityIndicator, Text, View } from 'react-native';

import { useClientTrainingSummary } from '../hooks/useWorkouts';

interface TrainingSummaryCardProps {
  clientId: string;
  /** Título de la card. Por defecto "Adherencia" (vista del entrenador). */
  title?: string;
  /** Texto cuando no hay sesiones registradas. */
  emptyHint?: string;
}

function Metric({ value, label }: { value: string; label: string }): React.JSX.Element {
  return (
    <View className="flex-1 items-center">
      <Text className="text-lg font-extrabold text-ink">{value}</Text>
      <Text className="mt-0.5 text-center text-xs text-ink-muted">{label}</Text>
    </View>
  );
}

/**
 * Card "Adherencia" del perfil del cliente, con datos reales del registro de
 * entrenamientos: sesiones del mes, racha de semanas y última sesión. Sin
 * porcentaje de adherencia (no hay agenda real de sesiones esperadas).
 */
export function TrainingSummaryCard({
  clientId,
  title = 'Adherencia',
  emptyHint = 'Sin sesiones registradas todavía. Usa "+ Registrar sesión" en la pestaña Entrenos.',
}: TrainingSummaryCardProps): React.JSX.Element {
  const summary = useClientTrainingSummary(clientId);

  return (
    <View className="gap-3 rounded-2xl border border-line bg-surface-subtle p-4">
      <Text className="text-sm font-bold text-ink">{title}</Text>

      {summary.status === 'loading' ? (
        <ActivityIndicator color="#2563EB" />
      ) : summary.status === 'error' ? (
        <Text className="text-xs text-ink-muted">{summary.error}</Text>
      ) : summary.data.totalSessions === 0 ? (
        <Text className="text-xs text-ink-muted">{emptyHint}</Text>
      ) : (
        <View className="flex-row">
          <Metric value={String(summary.data.sessionsThisMonth)} label="Sesiones este mes" />
          <Metric
            value={String(summary.data.currentStreakWeeks)}
            label={summary.data.currentStreakWeeks === 1 ? 'Semana de racha' : 'Semanas de racha'}
          />
          <Metric value={summary.data.lastSessionDate ?? '—'} label="Última sesión" />
        </View>
      )}
    </View>
  );
}
