import { useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useClients } from '@/features/clients';
import { useCoachThreads } from '@/features/messages';

const WHEN_FMT = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** Lista de conversaciones del entrenador con sus clientes (entrada del Drawer). */
export default function MessagesScreen(): React.JSX.Element {
  const router = useRouter();
  const threads = useCoachThreads();
  const clients = useClients();

  const nameById = new Map(
    clients.status === 'ready' ? clients.data.map((c) => [c.id, c]) : [],
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Mensajes" />

      {threads.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : threads.status === 'error' ? (
        <FeedbackState variant="error" message={threads.error} />
      ) : (
        <FlatList
          data={threads.data}
          keyExtractor={(thread) => thread.clientId}
          contentContainerClassName="gap-3 px-5 pb-8 pt-2"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text className="px-1 pt-6 text-sm text-ink-muted">
              Aún no tienes conversaciones. Escribe a un cliente desde su perfil.
            </Text>
          }
          renderItem={({ item }) => {
            const client = nameById.get(item.clientId);
            const unread = item.lastSender === 'client';
            return (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push(`/(app)/(tabs)/clients/${item.clientId}/messages`)
                }
                className={
                  unread
                    ? 'flex-row items-center gap-3 rounded-xl bg-primary-light p-3 active:bg-surface-field'
                    : 'flex-row items-center gap-3 rounded-xl bg-surface-subtle p-3 active:bg-surface-field'
                }
              >
                <Avatar uri={client?.avatarUrl} size={48} />
                <View className="flex-1 gap-1">
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`text-base ${unread ? 'font-extrabold text-ink' : 'font-bold text-ink'}`}
                    >
                      {client?.name ?? 'Cliente'}
                    </Text>
                    <Text className="text-xs text-ink-faint">
                      {WHEN_FMT.format(new Date(item.lastAt))}
                    </Text>
                  </View>
                  <Text
                    className={`text-sm ${unread ? 'font-semibold text-ink' : 'text-ink-muted'}`}
                    numberOfLines={1}
                  >
                    {item.lastSender === 'coach' ? 'Tú: ' : ''}
                    {item.lastText}
                  </Text>
                </View>
                {unread ? <View className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
