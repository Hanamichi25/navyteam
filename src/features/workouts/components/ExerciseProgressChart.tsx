import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import { Text, useWindowDimensions, View } from 'react-native';

import { COLORS } from '@/lib/colors';
import type { ExerciseProgress } from '@/types/workout';

/** px de padding horizontal a descontar: `px-5` de la pantalla + `p-4` de la card. */
const HORIZONTAL_PADDING = 20 * 2 + 16 * 2;

interface ExerciseProgressChartProps {
  progress: ExerciseProgress;
}

function PrTile({ value, label }: { value: string; label: string }): React.JSX.Element {
  return (
    <View className="flex-1 items-center rounded-xl border border-line bg-surface-subtle px-2 py-3">
      <Text className="text-base font-extrabold text-ink">{value}</Text>
      <Text className="mt-0.5 text-center text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {label}
      </Text>
    </View>
  );
}

/** Card de progresión de carga (1RM estimado) + récords personales de un ejercicio. */
export function ExerciseProgressChart({
  progress,
}: ExerciseProgressChartProps): React.JSX.Element {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.max(screenWidth - HORIZONTAL_PADDING, 200);

  if (progress.points.length === 0) {
    return (
      <View className="items-center justify-center gap-2 rounded-xl border border-line bg-surface-subtle p-6">
        <Ionicons name="barbell-outline" size={28} color={COLORS.inkFaint} />
        <Text className="text-center text-sm text-ink-muted">
          Sin series registradas de este ejercicio todavía.
        </Text>
      </View>
    );
  }

  const data = progress.points.map((point) => ({
    value: point.estimated1RM,
    label: point.date.slice(0, 5),
  }));

  return (
    <View className="gap-4">
      <View className="gap-3 rounded-xl border border-line bg-surface-subtle p-4">
        <Text className="text-sm font-bold text-ink">1RM estimado (Epley)</Text>
        <View className="items-center pt-2">
          <LineChart
            data={data}
            width={chartWidth}
            height={160}
            color={COLORS.primary}
            thickness={2}
            curved
            dataPointsColor={COLORS.primary}
            yAxisTextStyle={{ color: COLORS.inkFaint, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: COLORS.inkFaint, fontSize: 10 }}
            yAxisColor="#E2E8F0"
            xAxisColor="#E2E8F0"
            rulesColor="#E2E8F0"
            rulesType="dashed"
            initialSpacing={12}
            endSpacing={12}
            noOfSections={4}
          />
        </View>
      </View>

      <View className="flex-row gap-3">
        <PrTile value={`${progress.prWeightKg} kg`} label="PR de carga" />
        <PrTile value={`${progress.prEstimated1RM} kg`} label="PR 1RM est." />
        <PrTile
          value={progress.prVolumeKg.toLocaleString('es-ES')}
          label="PR de volumen (kg)"
        />
      </View>
    </View>
  );
}
