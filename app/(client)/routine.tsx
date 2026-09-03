import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateStrip } from '@/components/DateStrip';
import { FeedbackState } from '@/components/FeedbackState';
import { useAuthStore } from '@/features/auth';
import { useClient } from '@/features/clients';
import { CoachMessageCard } from '@/features/messages';
import {
  AssignedRoutineView,
  TodayRoutineCard,
  WeekScheduleStrip,
} from '@/features/routines';
import { weekdayNameEs } from '@/lib/date';
import { parseSchedule } from '@/lib/schedule';

/** Frase "Entrenas lunes, miércoles y viernes." a partir de los horarios. */
function trainingDaysSentence(schedules: string[]): string {
  const days = new Set<number>();
  for (const schedule of schedules) {
    for (const day of parseSchedule(schedule)) days.add(day);
  }
  const names = [...days].sort((a, b) => a - b).map((index) => weekdayNameEs(index));
  if (names.length === 0) return 'Aún no tienes días de entrenamiento asignados.';
  if (names.length === 1) return `Entrenas los ${names[0]}.`;
  return `Entrenas ${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}.`;
}

export default function ClientHomeScreen(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clientId = user?.clientId ?? '';
  const client = useClient(clientId, clientId !== '');
  const [openRoutineId, setOpenRoutineId] = useState<string | null>(null);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const firstName = user.name.split(' ')[0] ?? user.name;
  const routines =
    client.status === 'ready' ? client.data.assignedRoutines : [];
  const schedules = routines.map((routine) => routine.schedule);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <DateStrip />

      {!clientId ? (
        <FeedbackState
          variant="error"
          message="Tu cuenta no está vinculada a un perfil de cliente."
        />
      ) : client.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : client.status === 'error' ? (
        <FeedbackState variant="error" message={client.error} />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6 px-5 pb-8 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-2xl font-extrabold text-ink">Hola, {firstName}</Text>

          <CoachMessageCard
            clientId={clientId}
            onOpen={() => router.push('/(client)/messages')}
          />

          {routines.length === 0 ? (
            <View className="items-center gap-2 rounded-2xl border border-line bg-surface-subtle p-6">
              <Ionicons name="barbell-outline" size={28} color="#94A3B8" />
              <Text className="text-center text-sm text-ink-muted">
                Tu entrenador todavía no te ha asignado ninguna rutina.
              </Text>
            </View>
          ) : (
            <>
              <TodayRoutineCard
                assignedRoutines={routines}
                onStartWorkout={(routineId) =>
                  router.push({
                    pathname: '/(client)/workouts/start',
                    params: { routineId },
                  })
                }
              />

              <View className="gap-2.5">
                <Text className="text-base font-bold text-ink">Tu semana</Text>
                <WeekScheduleStrip schedules={schedules} />
                <Text className="text-xs text-ink-faint">
                  {trainingDaysSentence(schedules)}
                </Text>
              </View>

              <View className="gap-2.5">
                <Text className="text-base font-bold text-ink">
                  {routines.length === 1 ? 'Tu rutina' : 'Tus rutinas'}
                </Text>
                {routines.map((routine) => {
                  const open = openRoutineId === routine.id;
                  return (
                    <View
                      key={routine.id}
                      className="gap-3 rounded-2xl border border-line bg-surface-subtle p-3"
                    >
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ expanded: open }}
                        onPress={() =>
                          setOpenRoutineId((current) =>
                            current === routine.id ? null : routine.id,
                          )
                        }
                        className="flex-row items-center gap-3"
                      >
                        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                          <Ionicons name="barbell-outline" size={20} color="#2563EB" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-bold text-ink">{routine.name}</Text>
                          <Text className="text-sm text-ink-muted">
                            {routine.schedule} · {routine.exerciseCount} ejercicios
                          </Text>
                        </View>
                        <Ionicons
                          name={open ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color="#94A3B8"
                        />
                      </Pressable>

                      {open ? (
                        <View className="border-t border-line pt-3">
                          <AssignedRoutineView routineId={routine.id} hideHeader />
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
