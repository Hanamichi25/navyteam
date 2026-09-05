import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { SectionList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateStrip } from '@/components/DateStrip';
import { Fab } from '@/components/Fab';
import { FeedbackState } from '@/components/FeedbackState';
import { PeriodToggle } from '@/components/PeriodToggle';
import { useAuthStore } from '@/features/auth';
import {
  filterSessionsByPeriod,
  groupSessionsByDay,
  SessionSummaryRow,
  TrainedExerciseRow,
  TrainingSummaryCard,
  useClientWorkouts,
  useTrainedExercises,
  type WorkoutHistoryPeriod,
} from '@/features/workouts';
import type { WorkoutSessionSummary } from '@/types/workout';

const PERIOD_OPTIONS: readonly { value: WorkoutHistoryPeriod; label: string }[] = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
];

export default function ClientWorkoutsScreen(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clientId = user?.clientId ?? '';
  const workouts = useClientWorkouts(clientId);
  const trainedExercises = useTrainedExercises(clientId);
  const [period, setPeriod] = useState<WorkoutHistoryPeriod>('week');

  const sections = useMemo(() => {
    if (workouts.status !== 'ready') return [];
    const filtered = filterSessionsByPeriod(workouts.data, period);
    return groupSessionsByDay(filtered).map((group) => ({
      title: group.label,
      data: group.items,
    }));
  }, [workouts, period]);

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
          <SectionList<WorkoutSessionSummary>
            sections={sections}
            keyExtractor={(session) => session.id}
            contentContainerStyle={{
              gap: 12,
              paddingHorizontal: 20,
              paddingBottom: 96,
              paddingTop: 16,
            }}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            ListHeaderComponent={
              <View className="gap-4 pb-1">
                <Text className="text-2xl font-extrabold text-ink">Mis entrenos</Text>
                <TrainingSummaryCard
                  clientId={clientId}
                  title="Tu constancia"
                  emptyHint="Todavía no has registrado ningún entreno. Pulsa “Iniciar” en tu rutina de hoy, o el botón + de aquí."
                  weekSessions={workouts.data}
                />
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-bold text-ink">Historial</Text>
                  <PeriodToggle options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
                </View>
              </View>
            }
            renderSectionHeader={({ section }) => (
              <Text className="mb-1 mt-2 text-xs font-bold uppercase tracking-wide text-ink-faint">
                {section.title}
              </Text>
            )}
            ListEmptyComponent={
              <Text className="px-1 text-sm text-ink-muted">
                {period === 'week'
                  ? 'No hay entrenos esta semana.'
                  : 'No hay entrenos este mes.'}
              </Text>
            }
            renderItem={({ item }) => (
              <SessionSummaryRow
                summary={item}
                leadingDateBadge
                onPress={() => router.push(`/(client)/workouts/${item.id}`)}
              />
            )}
            ItemSeparatorComponent={() => <View className="h-3" />}
            ListFooterComponent={
              trainedExercises.status === 'ready' && trainedExercises.data.length > 0 ? (
                <View className="mt-3 gap-3">
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
