import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { COLORS } from '@/lib/colors';
import type { UpcomingSession } from '@/types/dashboard';

interface SessionRowProps {
  session: UpcomingSession;
  expanded: boolean;
  onToggle: () => void;
  onLogSession: () => void;
  onViewProfile: () => void;
}

/** Fila de la sección "Hoy": se expande al tocarla para mostrar acciones. */
export function SessionRow({
  session,
  expanded,
  onToggle,
  onLogSession,
  onViewProfile,
}: SessionRowProps): React.JSX.Element {
  return (
    <View className="rounded-xl border border-line bg-surface-subtle p-3">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`Sesión de ${session.clientName} a las ${session.time}`}
        onPress={onToggle}
        className="flex-row items-center gap-3"
      >
        <View className="w-11 items-center">
          <Text className="text-sm font-extrabold text-primary">{session.time}</Text>
          <Text className="text-xs text-ink-faint">{session.mode}</Text>
        </View>
        <View className="h-9 w-px bg-line" />
        <Avatar uri={session.clientAvatarUrl} size={40} />
        <View className="flex-1">
          <Text className="text-base font-bold text-ink">{session.clientName}</Text>
          <Text className="text-sm text-ink-muted">{session.focus}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.inkFaint}
        />
      </Pressable>

      {expanded ? (
        <View className="mt-3 border-t border-line pt-3">
          <Text className="text-xs text-ink-muted">{session.detail}</Text>
          <View className="mt-2.5 flex-row gap-2">
            <Pressable
              accessibilityRole="button"
              onPress={onLogSession}
              className="flex-1 items-center rounded-xl bg-primary py-2.5 active:bg-primary-dark"
            >
              <Text className="text-xs font-bold text-white">Registrar sesión</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onViewProfile}
              className="flex-1 items-center rounded-xl border border-line bg-surface py-2.5 active:bg-surface-subtle"
            >
              <Text className="text-xs font-bold text-ink">Ver perfil</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
