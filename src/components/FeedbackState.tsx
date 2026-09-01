import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, View } from 'react-native';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface FeedbackStateProps {
  variant: 'loading' | 'error' | 'empty';
  message?: string;
  /** Icono para 'empty' (por defecto una lupa). Ignorado en 'loading'. */
  iconName?: IoniconName;
}

const DEFAULTS: Record<'error' | 'empty', { icon: IoniconName; message: string }> = {
  error: { icon: 'alert-circle-outline', message: 'Algo salió mal. Inténtalo de nuevo.' },
  empty: { icon: 'search-outline', message: 'No hay nada por aquí todavía.' },
};

/** Estado a pantalla completa: cargando, error o vacío. */
export function FeedbackState({
  variant,
  message,
  iconName,
}: FeedbackStateProps): React.JSX.Element {
  if (variant === 'loading') {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#2563EB" />
      </View>
    );
  }

  const fallback = DEFAULTS[variant];

  return (
    <View className="flex-1 items-center justify-center gap-3 px-8">
      <Ionicons name={iconName ?? fallback.icon} size={40} color="#94A3B8" />
      <Text className="text-center text-base text-ink-muted">
        {message ?? fallback.message}
      </Text>
    </View>
  );
}
