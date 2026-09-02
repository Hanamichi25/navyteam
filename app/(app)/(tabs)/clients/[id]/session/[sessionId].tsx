import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useRemoveWorkoutSession, useWorkoutSession } from '@/features/workouts';
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
            <View className="gap-1">
              <Text className="text-xl font-extrabold text-ink">{session.data.routineName}</Text>
              <Text className="text-sm text-ink-faint">{session.data.date}</Text>
            </View>

            {session.data.notes ? (
              <View className="rounded-2xl border border-line bg-surface-subtle p-4">
                <Text className="text-sm text-ink-muted">{session.data.notes}</Text>
              </View>
            ) : null}

            {session.data.exercises.map((log) => (
              <View
                key={log.id}
                className="gap-3 rounded-2xl border border-line bg-surface-subtle p-4"
              >
                <Text className="text-sm font-bold text-ink">{log.exerciseName}</Text>

                <View className="flex-row items-center gap-2">
                  <Text className="w-5 text-center text-xs font-semibold text-ink-faint">#</Text>
                  <Text className="flex-1 text-center text-xs font-semibold text-ink-faint">Reps</Text>
                  <Text className="flex-1 text-center text-xs font-semibold text-ink-faint">Kg</Text>
                  <Text className="flex-1 text-center text-xs font-semibold text-ink-faint">RPE</Text>
                </View>

                {log.sets.map((set) => (
                  <View key={set.setNumber} className="flex-row items-center gap-2">
                    <Text className="w-5 text-center text-sm font-bold text-ink-faint">
                      {set.setNumber}
                    </Text>
                    <Text className="flex-1 text-center text-sm text-ink">{set.reps}</Text>
                    <Text className="flex-1 text-center text-sm text-ink">{set.weightKg}</Text>
                    <Text className="flex-1 text-center text-sm text-ink">{set.rpe ?? '—'}</Text>
                  </View>
                ))}
              </View>
            ))}
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
