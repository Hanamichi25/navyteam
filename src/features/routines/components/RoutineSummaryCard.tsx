import { Text, View } from 'react-native';

import type { RoutineCategory, RoutineLevel } from '@/types/routine';
import { ROUTINE_CATEGORY_LABEL, ROUTINE_LEVEL_LABEL } from '../labels';

interface RoutineSummaryCardProps {
  name: string;
  category: RoutineCategory | null;
  level: RoutineLevel | null;
  durationMin: number | null;
  exerciseCount: number;
  totalSets: number;
}

function Stat({ value, label }: { value: string; label: string }): React.JSX.Element {
  return (
    <View className="flex-1 items-center gap-0.5">
      <Text className="text-lg font-extrabold text-ink">{value}</Text>
      <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </Text>
    </View>
  );
}

/**
 * Cabecera del editor de rutina: nombre + categoría/nivel + cifras en vivo
 * (ejercicios, series totales, duración) que se actualizan mientras se edita.
 */
export function RoutineSummaryCard({
  name,
  category,
  level,
  durationMin,
  exerciseCount,
  totalSets,
}: RoutineSummaryCardProps): React.JSX.Element {
  const pills = [
    category ? ROUTINE_CATEGORY_LABEL[category] : null,
    level ? ROUTINE_LEVEL_LABEL[level] : null,
  ].filter((label): label is string => label !== null);

  return (
    <View className="gap-4 rounded-2xl bg-primary-light p-5">
      <View className="gap-2">
        <Text className="text-xs font-bold uppercase tracking-wide text-primary">Rutina</Text>
        <Text
          className={`text-xl font-extrabold ${name.trim() ? 'text-ink' : 'text-ink-faint'}`}
          numberOfLines={2}
        >
          {name.trim() || 'Sin nombre todavía'}
        </Text>
        {pills.length > 0 ? (
          <View className="flex-row flex-wrap gap-2 pt-0.5">
            {pills.map((label) => (
              <View key={label} className="rounded-full bg-surface px-3 py-1">
                <Text className="text-xs font-semibold text-primary">{label}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View className="h-px" style={{ backgroundColor: 'rgba(255,255,255,0.65)' }} />

      <View className="flex-row">
        <Stat
          value={String(exerciseCount)}
          label={exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
        />
        <Stat value={String(totalSets)} label={totalSets === 1 ? 'serie' : 'series'} />
        <Stat value={durationMin && durationMin > 0 ? `${durationMin}` : '—'} label="minutos" />
      </View>
    </View>
  );
}
