import { Alert, Platform } from 'react-native';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
}

/**
 * Diálogo de confirmación multiplataforma.
 * `Alert.alert` es un no-op en react-native-web (sin callbacks ni botones),
 * así que en web se usa `window.confirm` en su lugar.
 */
export function confirm(options: ConfirmOptions, onConfirm: () => void | Promise<void>): void {
  if (Platform.OS === 'web') {
    if (window.confirm(`${options.title}\n\n${options.message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(options.title, options.message, [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: options.confirmLabel,
      style: options.destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ]);
}
