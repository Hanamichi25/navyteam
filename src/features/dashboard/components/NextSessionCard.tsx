import { Pressable, Text, View } from 'react-native';

import type { UpcomingSession } from '@/types/dashboard';

interface NextSessionCardProps {
  session: UpcomingSession;
  onPress: () => void;
}

/** Banner destacado con la próxima sesión del día. */
export function NextSessionCard({
  session,
  onPress,
}: NextSessionCardProps): React.JSX.Element {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl bg-primary-light p-3.5">
      <View className="items-center">
        <Text className="text-xs font-semibold uppercase tracking-wide text-primary">
          Hoy
        </Text>
        <Text className="text-lg font-extrabold text-primary-dark">
          {session.time}
        </Text>
      </View>
      <View className="h-10 w-px bg-surface" />
      <View className="flex-1">
        <Text className="text-xs font-semibold uppercase tracking-wide text-primary">
          Próxima sesión
        </Text>
        <Text className="mt-0.5 text-base font-extrabold text-ink">
          {session.clientName}
        </Text>
        <Text className="text-xs text-ink-muted">
          {session.focus} · {session.mode}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver a ${session.clientName}`}
        onPress={onPress}
        className="rounded-full bg-primary px-4 py-2 active:bg-primary-dark"
      >
        <Text className="text-xs font-bold text-white">Ver</Text>
      </Pressable>
    </View>
  );
}
