import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { useClient } from '@/features/clients';
import { MessageThread } from '@/features/messages';

/** Hilo de conversación del entrenador con un cliente. */
export default function ClientMessagesScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const client = useClient(id);
  const name = client.status === 'ready' ? client.data.name.split(' ')[0] : null;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={name ? `Mensajes con ${name}` : 'Mensajes'}
        centered
        onBack={() => router.back()}
      />
      <MessageThread
        clientId={id}
        viewerRole="coach"
        emptyHint="Aún no hay mensajes con este cliente. Escríbele el primero."
      />
    </SafeAreaView>
  );
}
