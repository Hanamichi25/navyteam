import { Text, View } from 'react-native';

/** Tono semántico del badge. */
export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  /** Alineación dentro de un contenedor en columna. */
  align?: 'start' | 'center';
  /** Clases extra de posición/margen desde el consumidor. */
  className?: string;
}

const TONE_STYLES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-field',
  primary: 'bg-primary-light',
  success: 'bg-emerald-100',
  warning: 'bg-amber-100',
  danger: 'bg-rose-100',
};

const TONE_TEXT: Record<BadgeTone, string> = {
  neutral: 'text-ink-muted',
  primary: 'text-primary',
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-rose-600',
};

/** Pastilla de estado/categoría (objetivo del cliente, nivel de rutina, etc.). */
export function Badge({
  label,
  tone = 'neutral',
  align = 'start',
  className = '',
}: BadgeProps): React.JSX.Element {
  return (
    <View
      className={`${align === 'center' ? 'self-center' : 'self-start'} rounded-full px-2.5 py-1 ${TONE_STYLES[tone]} ${className}`}
    >
      <Text className={`text-xs font-semibold ${TONE_TEXT[tone]}`}>{label}</Text>
    </View>
  );
}
