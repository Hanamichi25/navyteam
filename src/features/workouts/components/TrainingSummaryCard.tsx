import { ActivityIndicator, Text, View } from 'react-native';

import { COLORS } from '@/lib/colors';
import { monthDayShort, WEEKDAY_LETTERS, weekdayIndexMonday } from '@/lib/date';

import { useClientTrainingSummary } from '../hooks/useWorkouts';
import { weekdaysTrainedThisWeek } from '../progress';

interface TrainingSummaryCardProps {
  clientId: string;
  /** Título de la card. Por defecto "Adherencia" (vista del entrenador). */
  title?: string;
  /** Texto cuando no hay sesiones registradas. */
  emptyHint?: string;
  /**
   * Si se pasan las sesiones del cliente, la card añade una tira con los días
   * de la semana en curso en los que entrenó (vista de cliente).
   */
  weekSessions?: readonly { date: string }[];
}

function Metric({ value, label }: { value: string; label: string }): React.JSX.Element {
  return (
    <View className="flex-1 items-center gap-0.5">
      <Text className="text-xl font-extrabold text-ink">{value}</Text>
      <Text className="text-center text-xs text-ink-muted">{label}</Text>
    </View>
  );
}

/** Fecha `dd/mm/aaaa` → "2 sep" (o el propio texto si no parsea). */
function shortDate(value: string | null): string {
  if (!value) return '—';
  const parts = monthDayShort(value);
  return parts ? `${parts.day} ${parts.month}` : value;
}

function WeekStrip({
  sessions,
}: {
  sessions: readonly { date: string }[];
}): React.JSX.Element {
  const trained = weekdaysTrainedThisWeek(sessions);
  const today = weekdayIndexMonday();

  return (
    <View className="flex-row gap-1.5">
      {WEEKDAY_LETTERS.map((letter, index) => {
        const didTrain = trained.includes(index);
        const isToday = index === today;
        const container = didTrain
          ? 'border-primary bg-primary'
          : isToday
            ? 'border-primary-light bg-primary-light'
            : 'border-line bg-surface';
        const text = didTrain
          ? 'text-white'
          : isToday
            ? 'text-primary'
            : 'text-ink-faint';
        return (
          <View
            key={index}
            className={`h-9 flex-1 items-center justify-center rounded-lg border ${container}`}
          >
            <Text className={`text-xs font-bold ${text}`}>{letter}</Text>
          </View>
        );
      })}
    </View>
  );
}

/**
 * Card de adherencia del cliente, con datos reales del registro de
 * entrenamientos: sesiones del mes, racha de semanas y última sesión (fecha
 * corta). Sin porcentaje de adherencia (no hay agenda real de sesiones
 * esperadas). En la vista de cliente añade la tira de días de la semana.
 */
export function TrainingSummaryCard({
  clientId,
  title = 'Adherencia',
  emptyHint = 'Sin sesiones registradas todavía. Usa "+ Registrar sesión" en la pestaña Entrenos.',
  weekSessions,
}: TrainingSummaryCardProps): React.JSX.Element {
  const summary = useClientTrainingSummary(clientId);

  return (
    <View className="gap-3.5 rounded-2xl border border-line bg-surface-subtle p-4">
      <Text className="text-xs font-bold uppercase tracking-wide text-ink-faint">
        {title}
      </Text>

      {summary.status === 'loading' ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : summary.status === 'error' ? (
        <Text className="text-xs text-ink-muted">{summary.error}</Text>
      ) : summary.data.totalSessions === 0 ? (
        <Text className="text-xs text-ink-muted">{emptyHint}</Text>
      ) : (
        <>
          <View className="flex-row items-stretch">
            <Metric value={String(summary.data.sessionsThisMonth)} label="Este mes" />
            <View className="w-px self-stretch bg-line" />
            <Metric
              value={String(summary.data.currentStreakWeeks)}
              label={
                summary.data.currentStreakWeeks === 1
                  ? 'Semana de racha'
                  : 'Semanas de racha'
              }
            />
            <View className="w-px self-stretch bg-line" />
            <Metric value={shortDate(summary.data.lastSessionDate)} label="Última sesión" />
          </View>

          {weekSessions ? (
            <>
              <View className="h-px bg-line" />
              <WeekStrip sessions={weekSessions} />
            </>
          ) : null}
        </>
      )}
    </View>
  );
}
