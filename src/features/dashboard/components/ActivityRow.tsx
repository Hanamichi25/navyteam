import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { COLORS } from '@/lib/colors';
import type { ActivityItem } from '@/types/dashboard';

import { ACTIVITY_KIND_META } from '../labels';

interface ActivityRowProps {
  item: ActivityItem;
  /** Si se pasa, la fila es pulsable y muestra un chevron. */
  onPress?: () => void;
}

/** Fila del feed "Actividad reciente", con icono según el tipo de actividad. */
export function ActivityRow({ item, onPress }: ActivityRowProps): React.JSX.Element {
  const meta = ACTIVITY_KIND_META[item.kind];

  const content = (
    <View className="flex-row items-center gap-3">
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${meta.bg}`}
      >
        <Ionicons name={meta.icon} size={17} color={meta.fg} />
      </View>
      <View className="flex-1">
        <Text className="text-sm leading-5 text-ink" numberOfLines={2}>
          <Text className="font-bold">{item.actorName}</Text> {item.action}
        </Text>
        <Text className="mt-0.5 text-xs text-ink-faint">{item.timeAgo}</Text>
      </View>
      {onPress ? (
        <Ionicons name="chevron-forward" size={16} color={COLORS.inkFaint} />
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="active:opacity-70">
      {content}
    </Pressable>
  );
}
