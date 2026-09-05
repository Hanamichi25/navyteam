import { Text, View } from 'react-native';

import { parseDdMmAaaa } from '@/lib/date';
import type { BodyMeasurement } from '@/types/client';

interface MeasurementHistoryListProps {
  measurements: BodyMeasurement[];
}

/** Otras medidas presentes en una fila, formateadas como "Cintura 80cm". */
function extraMeasures(measurement: BodyMeasurement): string | null {
  const parts: string[] = [];
  if (measurement.waistCm !== undefined) parts.push(`Cintura ${measurement.waistCm}cm`);
  if (measurement.chestCm !== undefined) parts.push(`Pecho ${measurement.chestCm}cm`);
  if (measurement.hipCm !== undefined) parts.push(`Cadera ${measurement.hipCm}cm`);
  if (measurement.armCm !== undefined) parts.push(`Brazo ${measurement.armCm}cm`);
  return parts.length > 0 ? parts.join(' · ') : null;
}

/** Historial de mediciones del perfil de cliente, más reciente primero. */
export function MeasurementHistoryList({
  measurements,
}: MeasurementHistoryListProps): React.JSX.Element | null {
  if (measurements.length === 0) return null;

  const sorted = [...measurements].sort((a, b) => {
    const dateA = parseDdMmAaaa(a.date)?.getTime() ?? 0;
    const dateB = parseDdMmAaaa(b.date)?.getTime() ?? 0;
    return dateB - dateA;
  });

  return (
    <View className="gap-2">
      {sorted.map((measurement) => {
        const extra = extraMeasures(measurement);
        return (
          <View
            key={measurement.id}
            className="flex-row items-center justify-between rounded-2xl border border-line bg-surface p-3"
          >
            <View>
              <Text className="text-sm font-semibold text-ink">{measurement.date}</Text>
              {extra ? <Text className="mt-0.5 text-xs text-ink-faint">{extra}</Text> : null}
            </View>
            <Text className="text-sm font-bold text-primary">{measurement.weightKg} kg</Text>
          </View>
        );
      })}
    </View>
  );
}
