import { Redirect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuthStore } from '@/features/auth';
import { SessionLoggerForm } from '@/features/workouts';

export default function ClientLogSessionScreen(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clientId = user?.clientId ?? '';

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Registrar Sesión" centered onBack={() => router.back()} />
      {clientId ? (
        <SessionLoggerForm
          clientId={clientId}
          onDone={() => router.back()}
          emptyMessage="Tu entrenador todavía no te ha asignado ninguna rutina, así que no puedes registrar una sesión."
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
