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

/** Card "Progreso de peso" del perfil de cliente. */
export function WeightProgressCard({
  progress,
}: WeightProgressCardProps): React.JSX.Element {
  return (
    <View className="gap-3 rounded-2xl border border-line bg-surface-subtle p-4">
      <Text className="text-sm font-bold text-ink">Progreso de peso</Text>

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
