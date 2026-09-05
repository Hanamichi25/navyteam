import { Text, View } from 'react-native';

interface MetricTileProps {
  /** Valor destacado, ya formateado (ej: "65 kg"). */
  value: string;
  label: string;
}

/** Recuadro con un valor grande y su etiqueta (Peso, Altura, IMC...). */
export function MetricTile({ value, label }: MetricTileProps): React.JSX.Element {
  return (
    <View className="flex-1 items-center rounded-xl bg-surface px-2 py-3 shadow-sm shadow-primary/10">
      <Text className="text-lg font-extrabold text-ink">{value}</Text>
      <Text className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {label}
      </Text>
    </View>
  );
}
