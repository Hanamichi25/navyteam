import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
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
  useClient,
  WeightProgressCard,
} from '@/features/clients';

type ProfileTab = 'routines' | 'nutrition' | 'messages';

const TABS: readonly { value: ProfileTab; label: string }[] = [
  { value: 'routines', label: 'Rutinas' },
  { value: 'nutrition', label: 'Alimentación' },
  { value: 'messages', label: 'Mensajes' },
];

export default function ClientProfileScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const client = useClient(id);
  const [tab, setTab] = useState<ProfileTab>('routines');

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Perfil de Usuario"
        centered
        onBack={() => router.back()}
        action={{
          iconName: 'ellipsis-horizontal',
          accessibilityLabel: 'Más opciones',
          onPress: () => {
            // TODO(backend): menú contextual (editar, archivar, eliminar).
          },
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
              </Text>
            </View>

            <View className="flex-row gap-3">
              <MetricTile value={`${client.data.weightKg} kg`} label="Peso" />
              <MetricTile value={`${client.data.heightCm} cm`} label="Altura" />
              <MetricTile value={client.data.bmi.toFixed(1)} label="IMC" />
            </View>

            <WeightProgressCard progress={client.data.weightProgress} />

            <View className="flex-row rounded-2xl bg-surface-field p-1">
              {TABS.map((item) => {
                const active = item.value === tab;
                return (
                  <Text
                    key={item.value}
                    onPress={() => setTab(item.value)}
                    className={`flex-1 rounded-xl py-2 text-center text-sm font-semibold ${
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
                {client.data.assignedRoutines.length === 0 ? (
                  <Text className="text-sm text-ink-muted">
                    Sin rutinas asignadas.
                  </Text>
                ) : (
                  client.data.assignedRoutines.map((routine) => (
                    <AssignedRoutineRow key={routine.id} routine={routine} />
                  ))
                )}
              </View>
            ) : null}

            {tab === 'nutrition' ? (
              <View className="gap-3">
                {client.data.assignedPlanName ? (
                  <View className="rounded-2xl border border-line bg-surface-subtle p-4">
                    <Text className="text-sm font-bold text-ink">
                      {client.data.assignedPlanName}
                    </Text>
                    <Text className="mt-0.5 text-xs text-ink-faint">
                      Plan de alimentación asignado
                    </Text>
                  </View>
                ) : (
                  <Text className="text-sm text-ink-muted">
                    Sin plan de alimentación asignado.
                  </Text>
                )}
              </View>
            ) : null}

            {tab === 'messages' ? (
              <Text className="py-4 text-center text-sm text-ink-muted">
                No hay mensajes todavía.
              </Text>
            ) : null}
          </ScrollView>

          <View className="border-t border-line px-5 py-3">
            <Button
              label="Enviar Feedback"
              fullWidth
              onPress={() => {
                // TODO(backend): abrir composición de feedback para el cliente.
              }}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
