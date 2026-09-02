import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import type { Achievement } from '@/types/dashboard';

import { ACHIEVEMENT_KIND_META } from '../labels';

interface AchievementRowProps {
  item: Achievement;
  onPress: () => void;
}

/**
 * Fila del bloque "Logros de la semana": foto del cliente, el logro y un icono
 * según su tipo (récord de carga / 1RM / volumen, o racha). Al tocarla se abre
 * el progreso del ejercicio (si es un PR) o el perfil del cliente.
 */
export function AchievementRow({ item, onPress }: AchievementRowProps): React.JSX.Element {
  const meta = ACHIEVEMENT_KIND_META[item.kind];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.clientName}: ${item.detail}`}
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface-subtle p-3 active:bg-surface-field"
    >
      <Avatar uri={item.clientAvatarUrl} size={38} />
      <View className="flex-1">
        <Text className="text-sm font-bold text-ink" numberOfLines={1}>
          {item.clientName}
        </Text>
        <Text className="text-xs leading-4 text-ink-muted" numberOfLines={2}>
          {item.detail}
        </Text>
      </View>
      <View className={`h-7 w-7 items-center justify-center rounded-full ${meta.bg}`}>
        <Ionicons name={meta.icon} size={14} color={meta.fg} />
      </View>
      <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
    </Pressable>
  );
}
