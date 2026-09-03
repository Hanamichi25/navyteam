import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useThread } from '../hooks/useMessages';

interface CoachMessageCardProps {
  clientId: string;
  /** Abre el hilo completo. */
  onOpen: () => void;
}

const DATE_FMT = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/**
 * Tarjeta del home del cliente con el último mensaje de su entrenador y un
 * acceso al hilo. Si el entrenador aún no escribió, invita a empezar la
 * conversación.
 */
export function CoachMessageCard({
  clientId,
  onOpen,
}: CoachMessageCardProps): React.JSX.Element | null {
  const thread = useThread(clientId);

  if (thread.status !== 'ready') return null;

  const lastCoachMessage = [...thread.data]
    .reverse()
    .find((message) => message.sender === 'coach');
  const unreadFromCoach =
    thread.data.length > 0 && thread.data[thread.data.length - 1]!.sender === 'coach';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Abrir mensajes con tu entrenador"
      onPress={onOpen}
      className="gap-3 rounded-2xl border border-line bg-surface-subtle p-4 active:bg-surface-field"
    >
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-light">
          <Ionicons name="chatbubble-ellipses" size={16} color="#2563EB" />
        </View>
        <Text className="flex-1 text-xs font-bold uppercase tracking-wide text-ink-faint">
          Mensaje de tu entrenador
        </Text>
        {unreadFromCoach ? (
          <View className="h-2 w-2 rounded-full bg-primary" />
        ) : null}
      </View>

      {lastCoachMessage ? (
        <>
          <Text className="text-sm leading-5 text-ink" numberOfLines={3}>
            {lastCoachMessage.text}
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-ink-faint">
              {DATE_FMT.format(new Date(lastCoachMessage.sentAt))}
            </Text>
            <Text className="text-xs font-bold text-primary">
              {unreadFromCoach ? 'Responder' : 'Abrir conversación'} ›
            </Text>
          </View>
        </>
      ) : (
        <>
          <Text className="text-sm text-ink-muted">
            Tu entrenador aún no te ha escrito. Puedes empezar tú la conversación.
          </Text>
          <Text className="self-end text-xs font-bold text-primary">Escribir ›</Text>
        </>
      )}
    </Pressable>
  );
}
