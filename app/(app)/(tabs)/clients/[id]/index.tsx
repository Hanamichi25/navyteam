import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { FeedbackState } from '@/components/FeedbackState';
import { MetricTile } from '@/components/MetricTile';
import { ScreenHeader } from '@/components/ScreenHeader';
import {
  AssignedRoutineRow,
  CLIENT_GOAL_LABEL,
  CLIENT_GOAL_TONE,
  MeasurementHistoryList,
  SubscriptionCard,
  useClient,
  useUnassignPlanFromClient,
  useUnassignRoutineFromClient,
  WeightEvolutionChart,
  WeightProgressCard,
} from '@/features/clients';
import { useThread } from '@/features/messages';
import {
  SessionSummaryRow,
  TrainedExerciseRow,
  TrainingSummaryCard,
  useClientWorkouts,
  useTrainedExercises,
} from '@/features/workouts';
import { computeAge } from '@/lib/date';

type ProfileTab = 'routines' | 'nutrition' | 'workouts' | 'messages';

const TABS: readonly { value: ProfileTab; label: string }[] = [
  { value: 'routines', label: 'Rutinas' },
  { value: 'nutrition', label: 'Nutrición' },
  { value: 'workouts', label: 'Entrenos' },
  { value: 'messages', label: 'Mensajes' },
];

export default function ClientProfileScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const client = useClient(id);
  const unassignRoutine = useUnassignRoutineFromClient();
  const unassignPlan = useUnassignPlanFromClient();
  const workouts = useClientWorkouts(id);
  const trainedExercises = useTrainedExercises(id);
  const thread = useThread(id);
  const [tab, setTab] = useState<ProfileTab>('routines');

  const lastMessage =
    thread.status === 'ready' && thread.data.length > 0
      ? thread.data[thread.data.length - 1]
      : null;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Perfil de Usuario"
        centered
        onBack={() => router.back()}
        action={{
          iconName: 'ellipsis-horizontal',
          accessibilityLabel: 'Más opciones',
          onPress: () => router.push(`/(app)/(tabs)/clients/${id}/edit`),
        }}
      />

      {client.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : client.status === 'error' ? (
        <FeedbackState variant="error" message={client.error} />
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 pb-6 gap-5"
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center gap-2 pt-2">
              <Avatar uri={client.data.avatarUrl} size={88} />
              <Text className="text-xl font-extrabold text-ink">
                {client.data.name}
              </Text>
              <Badge
                label={CLIENT_GOAL_LABEL[client.data.goal]}
                tone={CLIENT_GOAL_TONE[client.data.goal]}
                align="center"
              />
              <Text className="text-xs text-ink-faint">
                Miembro desde: {client.data.memberSince}
                {computeAge(client.data.birthDate) !== null
                  ? ` · ${computeAge(client.data.birthDate)} años`
                  : ''}
              </Text>
            </View>

            <View className="flex-row gap-3">
              <MetricTile value={`${client.data.weightKg} kg`} label="Peso" />
              <MetricTile value={`${client.data.heightCm} cm`} label="Altura" />
              <MetricTile value={client.data.bmi.toFixed(1)} label="IMC" />
            </View>

            <SubscriptionCard
              client={client.data}
              onRegisterPayment={() =>
                router.push(`/(app)/(tabs)/clients/${id}/register-payment`)
              }
            />

            <WeightProgressCard progress={client.data.weightProgress} />

            <WeightEvolutionChart measurements={client.data.measurements} />

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/(app)/(tabs)/clients/${id}/add-measurement`)}
              className="flex-row items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line py-3 active:bg-surface-subtle"
            >
              <Text className="text-sm font-semibold text-primary">+ Agregar medición</Text>
            </Pressable>

            <MeasurementHistoryList measurements={client.data.measurements} />

            <TrainingSummaryCard clientId={id} />

            <View className="flex-row rounded-2xl bg-surface-field p-1">
              {TABS.map((item) => {
                const active = item.value === tab;
                return (
                  <Text
                    key={item.value}
                    onPress={() => setTab(item.value)}
                    numberOfLines={1}
                    className={`flex-1 rounded-xl py-2 text-center text-xs font-semibold ${
                      active ? 'bg-surface text-primary' : 'text-ink-muted'
                    }`}
                  >
                    {item.label}
                  </Text>
                );
              })}
            </View>

            {tab === 'routines' ? (
              <View className="gap-3">
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push(`/(app)/(tabs)/clients/${id}/assign-routine`)}
                  className="flex-row items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line py-3 active:bg-surface-subtle"
                >
                  <Text className="text-sm font-semibold text-primary">+ Asignar rutina</Text>
                </Pressable>

                {client.data.assignedRoutines.length === 0 ? (
                  <Text className="text-sm text-ink-muted">
                    Sin rutinas asignadas.
                  </Text>
                ) : (
                  client.data.assignedRoutines.map((routine) => (
                    <AssignedRoutineRow
                      key={routine.id}
                      routine={routine}
                      onRemove={() =>
                        unassignRoutine.mutate({ clientId: id, routineId: routine.id })
                      }
                    />
                  ))
                )}
              </View>
            ) : null}

            {tab === 'nutrition' ? (
              <View className="gap-3">
                {client.data.assignedPlan ? (
                  <View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface-subtle p-4">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-ink">
                        {client.data.assignedPlan.name}
                      </Text>
                      <Text className="mt-0.5 text-xs text-ink-faint">
                        {client.data.assignedPlan.kcalPerDay} kcal/día
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Desasignar plan"
                      hitSlop={8}
                      onPress={() => unassignPlan.mutate(id)}
                      className="h-8 w-8 items-center justify-center rounded-lg active:bg-rose-50"
                    >
                      <Text className="text-lg leading-none text-ink-faint">×</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push(`/(app)/(tabs)/clients/${id}/assign-plan`)}
                    className="flex-row items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line py-3 active:bg-surface-subtle"
                  >
                    <Text className="text-sm font-semibold text-primary">+ Asignar plan</Text>
                  </Pressable>
                )}
              </View>
            ) : null}

            {tab === 'workouts' ? (
              <View className="gap-3">
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push(`/(app)/(tabs)/clients/${id}/log-session`)}
                  className="flex-row items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line py-3 active:bg-surface-subtle"
                >
                  <Text className="text-sm font-semibold text-primary">+ Registrar sesión</Text>
                </Pressable>

                <Text className="mt-1 text-sm font-bold text-ink">Historial</Text>
                {workouts.status === 'loading' ? (
                  <Text className="text-sm text-ink-faint">Cargando…</Text>
                ) : workouts.status === 'error' ? (
                  <Text className="text-sm text-red-500">{workouts.error}</Text>
                ) : workouts.data.length === 0 ? (
                  <Text className="text-sm text-ink-muted">Sin sesiones registradas.</Text>
                ) : (
                  workouts.data.map((summary) => (
                    <SessionSummaryRow
                      key={summary.id}
                      summary={summary}
                      onPress={() =>
                        router.push(`/(app)/(tabs)/clients/${id}/session/${summary.id}`)
                      }
                    />
                  ))
                )}

                {trainedExercises.status === 'ready' && trainedExercises.data.length > 0 ? (
                  <>
                    <Text className="mt-2 text-sm font-bold text-ink">Progreso por ejercicio</Text>
                    {trainedExercises.data.map((summary) => (
                      <TrainedExerciseRow
                        key={summary.exerciseId}
                        summary={summary}
                        onPress={() =>
                          router.push(
                            `/(app)/(tabs)/clients/${id}/progress/${summary.exerciseId}?name=${encodeURIComponent(summary.exerciseName)}`,
                          )
                        }
                      />
                    ))}
                  </>
                ) : null}
              </View>
            ) : null}

            {tab === 'messages' ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(`/(app)/(tabs)/clients/${id}/messages`)}
                className="gap-2 rounded-2xl border border-line bg-surface-subtle p-4 active:bg-surface-field"
              >
                <Text className="text-xs font-bold uppercase tracking-wide text-ink-faint">
                  {lastMessage
                    ? lastMessage.sender === 'coach'
                      ? 'Último mensaje · tú'
                      : `Último mensaje · ${client.data.name.split(' ')[0]}`
                    : 'Conversación'}
                </Text>
                <Text className="text-sm leading-5 text-ink" numberOfLines={3}>
                  {lastMessage?.text ??
                    'Aún no hay mensajes con este cliente. Toca para escribirle.'}
                </Text>
                <Text className="self-end text-xs font-bold text-primary">
                  Abrir conversación ›
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>

          <View className="border-t border-line px-5 py-3">
            <Button
              label="Escribir mensaje"
              fullWidth
              onPress={() => router.push(`/(app)/(tabs)/clients/${id}/messages`)}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
