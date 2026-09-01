import { Text, View } from 'react-native';

interface MetricTileProps {
  /** Valor destacado, ya formateado (ej: "65 kg"). */
  value: string;
  label: string;
}

/** Recuadro con un valor grande y su etiqueta (Peso, Altura, IMC...). */
export function MetricTile({ value, label }: MetricTileProps): React.JSX.Element {
  return (
    <View className="flex-1 items-center rounded-2xl border border-line bg-surface-subtle px-2 py-3">
      <Text className="text-lg font-extrabold text-ink">{value}</Text>
      <Text className="mt-0.5 text-xs text-ink-muted">{label}</Text>
    </View>
  );
}
