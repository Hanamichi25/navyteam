import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

type ButtonVariant = 'primary' | 'outline';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** Muestra un spinner y bloquea el botón. */
  loading?: boolean;
  disabled?: boolean;
  /** Icono opcional a la izquierda del texto (ej: logo de Google). */
  icon?: ReactNode;
  /** Ocupa todo el ancho disponible. */
  fullWidth?: boolean;
}

const CONTAINER_BASE =
  'h-14 flex-row items-center justify-center gap-3 rounded-2xl px-5';

const CONTAINER_BY_VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:bg-primary-dark',
  outline: 'border border-line bg-surface active:bg-surface-subtle',
};

const LABEL_BY_VARIANT: Record<ButtonVariant, string> = {
  primary: 'text-white',
  outline: 'text-ink',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
}: ButtonProps): React.JSX.Element {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      className={[
        CONTAINER_BASE,
        CONTAINER_BY_VARIANT[variant],
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-60' : '',
      ].join(' ')}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#0F172A'} />
      ) : (
        <>
          {icon}
          <Text className={`text-base font-semibold ${LABEL_BY_VARIANT[variant]}`}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
