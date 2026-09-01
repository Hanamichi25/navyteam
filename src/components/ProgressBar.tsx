import { View } from 'react-native';

interface ProgressBarProps {
  /** Fracción completada, 0..1. Se recorta al rango válido. */
  progress: number;
}

/** Barra de progreso simple (una sola serie). */
export function ProgressBar({ progress }: ProgressBarProps): React.JSX.Element {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View className="h-2 w-full overflow-hidden rounded-full bg-line">
      <View
        className="h-full rounded-full bg-primary"
        style={{ width: `${clamped * 100}%` }}
      />
    </View>
  );
}
