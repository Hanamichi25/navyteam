import { Image, Text, View } from 'react-native';

import type { ActivityItem } from '@/types/dashboard';

interface ActivityRowProps {
  item: ActivityItem;
}

/** Fila del feed "Actividad Reciente". */
export function ActivityRow({ item }: ActivityRowProps): React.JSX.Element {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface-subtle p-3">
      <Image
        source={{ uri: item.actorAvatarUrl }}
        className="h-10 w-10 rounded-full"
      />
      <View className="flex-1">
        <Text className="text-sm text-ink" numberOfLines={2}>
          <Text className="font-bold">{item.actorName}</Text> {item.action}
        </Text>
        <Text className="mt-0.5 text-xs text-ink-faint">{item.timeAgo}</Text>
      </View>
    </View>
  );
}
