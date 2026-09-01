import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import { Text, useWindowDimensions, View } from 'react-native';

import { parseDdMmAaaa } from '@/lib/date';
import type { BodyMeasurement } from '@/types/client';

/** px de padding horizontal a descontar: `px-5` de la pantalla + `p-4` de la card. */
const HORIZONTAL_PADDING = 20 * 2 + 16 * 2;

interface WeightEvolutionChartProps {
  measurements: BodyMeasurement[];
}

/** Corta el label a `dd/mm` para que quepan varios puntos en el eje X. */
function shortLabel(date: string): string {
  return date.slice(0, 5);
}

/** Card "Evolución de peso" del perfil de cliente, con gráfica de línea. */
export function WeightEvolutionChart({
  measurements,
}: WeightEvolutionChartProps): React.JSX.Element {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.max(screenWidth - HORIZONTAL_PADDING, 200);

  if (measurements.length === 0) {
    return (
      <View className="items-center justify-center gap-2 rounded-2xl border border-line bg-surface-subtle p-6">
        <Ionicons name="trending-up-outline" size={28} color="#94A3B8" />
        <Text className="text-center text-sm text-ink-muted">
          Sin mediciones todavía. Agrega la primera para ver la evolución de peso.
        </Text>
      </View>
    );
  }

  const sorted = [...measurements].sort((a, b) => {
    const dateA = parseDdMmAaaa(a.date)?.getTime() ?? 0;
    const dateB = parseDdMmAaaa(b.date)?.getTime() ?? 0;
    return dateA - dateB;
  });

  const data = sorted.map((measurement) => ({
    value: measurement.weightKg,
    label: shortLabel(measurement.date),
  }));

  return (
    <View className="gap-3 rounded-2xl border border-line bg-surface-subtle p-4">
      <Text className="text-sm font-bold text-ink">Evolución de peso</Text>

      <View className="items-center pt-2">
        <LineChart
          data={data}
          width={chartWidth}
          height={160}
          color="#2563EB"
          thickness={2}
          curved
          dataPointsColor="#2563EB"
          yAxisTextStyle={{ color: '#94A3B8', fontSize: 10 }}
          xAxisLabelTextStyle={{ color: '#94A3B8', fontSize: 10 }}
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
  );
}
