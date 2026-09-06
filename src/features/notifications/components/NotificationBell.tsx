import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { COLORS } from '@/lib/colors';

import { useUnreadNotificationCount } from '../hooks/useNotifications';

interface NotificationBellProps {
  onPress: () => void;
}

/** Campana con contador de no leídas para las cabeceras. */
export function NotificationBell({ onPress }: NotificationBellProps): React.JSX.Element {
  const unread = useUnreadNotificationCount();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        unread > 0 ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'
      }
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface active:bg-surface-subtle"
    >
      <Ionicons name="notifications-outline" size={20} color={COLORS.ink} />
      {unread > 0 ? (
        <View className="absolute -right-1 -top-1 h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1">
          <Text className="text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
