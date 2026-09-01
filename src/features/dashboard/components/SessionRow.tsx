import { Ionicons } from '@expo/vector-icons';
import { Image, Text, View } from 'react-native';

import type { UpcomingSession } from '@/types/dashboard';

interface SessionRowProps {
  session: UpcomingSession;
}

/** Fila de la sección "Próximas Sesiones". */
export function SessionRow({ session }: SessionRowProps): React.JSX.Element {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface-subtle p-3">
      <Image
        source={{ uri: session.clientAvatarUrl }}
        className="h-12 w-12 rounded-full"
      />
      <View className="flex-1">
        <Text className="text-base font-bold text-ink">{session.clientName}</Text>
        <Text className="mt-0.5 text-sm font-semibold text-primary">
          {session.time} - {session.mode}
        </Text>
        <Text className="text-sm text-ink-muted">{session.focus}</Text>
      </View>
      <View className="h-8 w-8 items-center justify-center rounded-full border border-line bg-surface">
        <Ionicons name="chevron-forward" size={16} color="#64748B" />
      </View>
    </View>
  );
}
