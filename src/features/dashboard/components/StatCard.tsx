import { Text, View } from 'react-native';

import type { DashboardStat } from '@/types/dashboard';

interface StatCardProps {
  stat: DashboardStat;
}

/** Tarjeta de métrica del encabezado del dashboard. */
export function StatCard({ stat }: StatCardProps): React.JSX.Element {
  return (
    <View className="flex-1 rounded-2xl border border-line bg-surface-subtle p-3">
      <Text className="text-2xl font-extrabold text-primary">{stat.value}</Text>
      <Text className="mt-1 text-xs leading-4 text-ink-muted">{stat.label}</Text>
    </View>
  );
}
