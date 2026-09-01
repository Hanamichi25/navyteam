import { View } from 'react-native';

import type { Macros } from '@/types/nutrition';

interface MacroBarProps {
  macros: Macros;
}

/** Barra apilada de 3 segmentos: proteína / carbohidratos / grasas. */
export function MacroBar({ macros }: MacroBarProps): React.JSX.Element {
  return (
    <View className="h-2 w-full flex-row overflow-hidden rounded-full bg-line">
      <View className="h-full bg-primary" style={{ width: `${macros.proteinPct}%` }} />
      <View className="h-full bg-blue-400" style={{ width: `${macros.carbsPct}%` }} />
      <View className="h-full bg-blue-200" style={{ width: `${macros.fatPct}%` }} />
    </View>
  );
}

/** Texto "P% / C% / G%" para acompañar la barra. */
export function formatMacros(macros: Macros): string {
  return `${macros.proteinPct}% / ${macros.carbsPct}% / ${macros.fatPct}%`;
}
