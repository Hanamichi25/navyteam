import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { relativeDayLabel } from '@/lib/date';
import type { AppNotification } from '@/types/notification';

import { NOTIFICATION_KIND_META } from '../labels';

interface NotificationRowProps {
  item: AppNotification;
  onPress: () => void;
}

/** Fila de la bandeja de notificaciones. */
export function NotificationRow({ item, onPress }: NotificationRowProps): React.JSX.Element {
  const meta = NOTIFICATION_KIND_META[item.kind] ?? NOTIFICATION_KIND_META.system;
  const unread = item.readAt === null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`flex-row items-start gap-3 rounded-2xl border p-3.5 active:bg-surface-subtle ${
        unread ? 'border-primary-light bg-primary-light' : 'border-line bg-surface'
      }`}
    >
      <View className={`h-9 w-9 items-center justify-center rounded-full ${meta.bg}`}>
        <Ionicons name={meta.icon} size={17} color={meta.fg} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text
          className={`text-sm text-ink ${unread ? 'font-extrabold' : 'font-bold'}`}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text className="text-sm leading-5 text-ink-muted" numberOfLines={2}>
          {item.body}
        </Text>
        <Text className="mt-0.5 text-xs text-ink-faint">
          {relativeDayLabel(new Date(item.createdAt), 'Sin fecha')}
        </Text>
      </View>
      {unread ? <View className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" /> : null}
    </Pressable>
  );
}
