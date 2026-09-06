import type { Ionicons } from '@expo/vector-icons';

import { COLORS } from '@/lib/colors';
import type { NotificationKind } from '@/types/notification';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

/** Icono y tono de cada tipo de notificación. */
export const NOTIFICATION_KIND_META: Record<
  NotificationKind,
  { icon: IoniconName; bg: string; fg: string }
> = {
  message: { icon: 'chatbubble-ellipses-outline', bg: 'bg-amber-100', fg: '#B45309' },
  workout: { icon: 'checkmark-done-outline', bg: 'bg-primary-light', fg: COLORS.primary },
  routine: { icon: 'barbell-outline', bg: 'bg-primary-light', fg: COLORS.primary },
  plan: { icon: 'nutrition-outline', bg: 'bg-emerald-100', fg: '#047857' },
  payment: { icon: 'card-outline', bg: 'bg-gold-light', fg: COLORS.gold },
  system: { icon: 'notifications-outline', bg: 'bg-surface-field', fg: COLORS.inkMuted },
};

/**
 * Ruta destino al tocar una notificación, según su payload (`data.type`) y el
 * rol del usuario. `null` = no navega (se queda en la bandeja).
 */
export function routeForNotification(
  data: Record<string, unknown>,
  role: 'coach' | 'client' | undefined,
): string | null {
  const type = typeof data.type === 'string' ? data.type : '';
  const clientId = typeof data.clientId === 'string' ? data.clientId : null;
  const sessionId = typeof data.sessionId === 'string' ? data.sessionId : null;

  if (role === 'coach') {
    switch (type) {
      case 'message':
        return clientId ? `/(app)/(tabs)/clients/${clientId}/messages` : '/(app)/messages';
      case 'workout':
        return clientId && sessionId
          ? `/(app)/(tabs)/clients/${clientId}/session/${sessionId}`
          : clientId
            ? `/(app)/(tabs)/clients/${clientId}`
            : '/(app)/(tabs)/dashboard';
      default:
        return clientId ? `/(app)/(tabs)/clients/${clientId}` : null;
    }
  }

  // Cliente
  switch (type) {
    case 'message':
      return '/(client)/messages';
    case 'routine':
      return '/(client)/routine';
    case 'plan':
      return '/(client)/nutrition';
    case 'payment':
      return '/(client)/account';
    default:
      return null;
  }
}
