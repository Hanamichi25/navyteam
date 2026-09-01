import type { ReactNode } from 'react';
import { View } from 'react-native';

interface CardProps {
  children: ReactNode;
  /** Clases extra de NativeWind para ajustar el layout desde el consumidor. */
  className?: string;
}

/** Contenedor blanco con borde sutil y esquinas redondeadas usado en el dashboard. */
export function Card({ children, className = '' }: CardProps): React.JSX.Element {
  return (
    <View className={`rounded-2xl border border-line bg-surface p-4 ${className}`}>
      {children}
    </View>
  );
}
