import { Redirect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuthStore } from '@/features/auth';
import { MessageThread } from '@/features/messages';

/** Conversación del cliente con su entrenador (se llega desde el home). */
export default function ClientMessagesScreen(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clientId = user?.clientId ?? '';

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Tu entrenador" centered onBack={() => router.back()} />
      {clientId ? (
        <MessageThread
          clientId={clientId}
          viewerRole="client"
          emptyHint="Escríbele a tu entrenador cualquier duda sobre tu rutina o tu plan."
        />
      ) : (
        <FeedbackState
          variant="error"
          message="Tu cuenta no está vinculada a un perfil de cliente."
        />
      )}
    </SafeAreaView>
  );
}
