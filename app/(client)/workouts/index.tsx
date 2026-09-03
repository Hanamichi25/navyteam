import { Redirect, useRouter } from 'expo-router';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateStrip } from '@/components/DateStrip';
import { Fab } from '@/components/Fab';
import { FeedbackState } from '@/components/FeedbackState';
import { useAuthStore } from '@/features/auth';
import {
  SessionSummaryRow,
  TrainedExerciseRow,
  TrainingSummaryCard,
  useClientWorkouts,
  useTrainedExercises,
} from '@/features/workouts';

export default function ClientWorkoutsScreen(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clientId = user?.clientId ?? '';
  const workouts = useClientWorkouts(clientId);
  const trainedExercises = useTrainedExercises(clientId);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const goToLog = (): void => router.push('/(client)/workouts/log');

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <DateStrip />

      {!clientId ? (
        <FeedbackState
          variant="error"
          message="Tu cuenta no está vinculada a un perfil de cliente."
        />
      ) : workouts.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : workouts.status === 'error' ? (
        <FeedbackState variant="error" message={workouts.error} />
      ) : (
        <>
          <FlatList
            data={workouts.data}
            keyExtractor={(session) => session.id}
            contentContainerClassName="gap-3 px-5 pb-24 pt-4"
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View className="gap-4 pb-1">
                <Text className="text-2xl font-extrabold text-ink">Mis entrenos</Text>
                <TrainingSummaryCard
                  clientId={clientId}
                  title="Tu constancia"
                  emptyHint="Todavía no has registrado ningún entreno. Pulsa “Iniciar” en tu rutina de hoy, o el botón + de aquí."
                  weekSessions={workouts.data}
                />
                {workouts.data.length > 0 ? (
                  <Text className="text-sm font-bold text-ink">Historial</Text>
                ) : null}
              </View>
            }
            ListEmptyComponent={
              <Text className="px-1 text-sm text-ink-muted">
                Cuando registres un entreno aparecerá aquí.
              </Text>
            }
            renderItem={({ item }) => (
              <SessionSummaryRow
                summary={item}
                leadingDateBadge
                onPress={() => router.push(`/(client)/workouts/${item.id}`)}
              />
            )}
            ListFooterComponent={
              trainedExercises.status === 'ready' && trainedExercises.data.length > 0 ? (
                <View className="mt-2 gap-3">
                  <Text className="text-sm font-bold text-ink">Progreso por ejercicio</Text>
                  {trainedExercises.data.map((summary) => (
                    <TrainedExerciseRow
                      key={summary.exerciseId}
                      summary={summary}
                      onPress={() =>
                        router.push(
                          `/(client)/workouts/progress/${summary.exerciseId}?name=${encodeURIComponent(summary.exerciseName)}`,
                        )
                      }
                    />
                  ))}
                </View>
              ) : null
            }
          />
          <Fab accessibilityLabel="Registrar sesión" onPress={goToLog} />
        </>
      )}
    </SafeAreaView>
  );
}
