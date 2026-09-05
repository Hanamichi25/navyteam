import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Badge, type BadgeTone } from '@/components/Badge';
import { COLORS } from '@/lib/colors';
import type { DashboardStat } from '@/types/dashboard';

import { STAT_ICONS } from '../labels';

interface StatCardProps {
  stat: DashboardStat;
}

const TREND_TONE: Record<DashboardStat['trend'], BadgeTone> = {
  up: 'success',
  down: 'danger',
  flat: 'neutral',
};

/** Formatea la variación con signo explícito (+3, −2, 0). */
function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `−${Math.abs(delta)}`;
  return '0';
}

/** Tarjeta de métrica del bloque "Resumen" del dashboard. */
export function StatCard({ stat }: StatCardProps): React.JSX.Element {
  return (
    <View className="flex-1 rounded-xl border border-line bg-surface-subtle p-3">
      <View className="flex-row items-center justify-between">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-light">
          <Ionicons
            name={STAT_ICONS[stat.id] ?? 'stats-chart-outline'}
            size={16}
            color={COLORS.primary}
          />
        </View>
        <Badge
          label={formatDelta(stat.delta)}
          tone={TREND_TONE[stat.trend]}
          align="center"
        />
      </View>
      <Text className="mt-2 text-2xl font-extrabold text-ink">{stat.value}</Text>
      <Text className="mt-0.5 text-xs leading-4 text-ink-muted">{stat.label}</Text>
    </View>
  );
}
