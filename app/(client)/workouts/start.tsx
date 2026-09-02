import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedbackState } from '@/components/FeedbackState';
import { useAuthStore } from '@/features/auth';
import { ActiveSessionForm } from '@/features/workouts';

/** Entreno en curso: el cliente arranca desde su rutina de hoy (modal). */
export default function ClientStartWorkoutScreen(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const clientId = user?.clientId ?? '';

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      {clientId && routineId ? (
        <ActiveSessionForm
          clientId={clientId}
          routineId={routineId}
          onDone={() => router.replace('/(client)/workouts')}
          onDiscard={() => router.back()}
        />
      ) : (
        <FeedbackState
          variant="error"
          message="No se pudo iniciar el entreno. Vuelve a tu rutina e inténtalo de nuevo."
        />
      )}
    </SafeAreaView>
  );
}
