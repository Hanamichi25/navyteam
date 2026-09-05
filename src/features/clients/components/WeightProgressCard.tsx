import { Text, View } from 'react-native';

import { ProgressBar } from '@/components/ProgressBar';
import type { WeightProgress } from '@/types/client';

interface WeightProgressCardProps {
  progress: WeightProgress;
}

/** Fracción 0..1 de avance entre el peso inicial y la meta. */
function computeFraction({ startKg, currentKg, goalKg }: WeightProgress): number {
  const total = startKg - goalKg;
  if (total === 0) return currentKg === goalKg ? 1 : 0;
  return (startKg - currentKg) / total;
}

/**
 * Barra de avance entre el peso inicial y la meta. Pensado para ir dentro de
 * un `CollapsibleSection` — sin contenedor propio.
 */
export function WeightProgressCard({
  progress,
}: WeightProgressCardProps): React.JSX.Element {
  return (
    <View className="gap-3">
      <ProgressBar progress={computeFraction(progress)} />

      <View className="flex-row justify-between">
        <Text className="text-xs text-ink-faint">Inicio: {progress.startKg}kg</Text>
        <Text className="text-xs font-bold text-primary">
          Actual: {progress.currentKg}kg
        </Text>
        <Text className="text-xs font-semibold text-emerald-600">
          Meta: {progress.goalKg}kg
        </Text>
      </View>
    </View>
  );
}
