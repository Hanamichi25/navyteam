import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import type { Client } from '@/types/client';
import { CLIENT_GOAL_LABEL, CLIENT_GOAL_TONE } from '../labels';

interface ClientListItemProps {
  client: Client;
  onPress: () => void;
}

/** Fila de la lista "Mis Usuarios". */
export function ClientListItem({
  client,
  onPress,
}: ClientListItemProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver perfil de ${client.name}`}
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface-subtle p-3 active:bg-surface-field"
    >
      <Avatar uri={client.avatarUrl} size={48} />

      <View className="flex-1 gap-1">
        <Text className="text-base font-bold text-ink">{client.name}</Text>
        <Badge
          label={CLIENT_GOAL_LABEL[client.goal]}
          tone={CLIENT_GOAL_TONE[client.goal]}
        />
        <Text className="text-xs text-ink-faint">{client.lastActivity}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </Pressable>
  );
}
