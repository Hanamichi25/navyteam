import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import {
  SessionDetailView,
  useRemoveWorkoutSession,
  useWorkoutSession,
} from '@/features/workouts';
import { confirm } from '@/lib/confirm';

export default function WorkoutSessionScreen(): React.JSX.Element {
  const router = useRouter();
  const { id, sessionId } = useLocalSearchParams<{ id: string; sessionId: string }>();
  const session = useWorkoutSession(sessionId);
  const removeSession = useRemoveWorkoutSession();

  const confirmDelete = (): void => {
    confirm(
      {
        title: 'Eliminar sesión',
        message: '¿Seguro que quieres eliminar este registro de entrenamiento?',
        confirmLabel: 'Eliminar',
        destructive: true,
      },
      async () => {
        await removeSession.mutateAsync({ sessionId, clientId: id });
        router.back();
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Sesión" centered onBack={() => router.back()} />

      {session.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : session.status === 'error' ? (
        <FeedbackState variant="error" message={session.error} />
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-5 px-5 pt-2 pb-6"
            showsVerticalScrollIndicator={false}
          >
            <SessionDetailView session={session.data} />
          </ScrollView>

          <View className="border-t border-line px-5 py-3">
            <Button
              label="Eliminar sesión"
              variant="outline"
              fullWidth
              loading={removeSession.isPending}
              onPress={confirmDelete}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
