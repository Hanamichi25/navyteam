import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAssignRoutineToClient, useClient } from '@/features/clients';
import { ROUTINE_CATEGORY_LABEL, useRoutines } from '@/features/routines';
import type { Routine } from '@/types/routine';

const DAYS: readonly { value: string; label: string }[] = [
  { value: 'Lun', label: 'L' },
  { value: 'Mar', label: 'M' },
  { value: 'Mié', label: 'X' },
  { value: 'Jue', label: 'J' },
  { value: 'Vie', label: 'V' },
  { value: 'Sáb', label: 'S' },
  { value: 'Dom', label: 'D' },
];

export default function AssignRoutineScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const client = useClient(id);
  const routines = useRoutines();
  const assignRoutine = useAssignRoutineToClient();

  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const assignedIds = useMemo(
    () => new Set(client.status === 'ready' ? client.data.assignedRoutines.map((r) => r.id) : []),
    [client],
  );

  const availableRoutines = useMemo(() => {
    if (routines.status !== 'ready') return [];
    return routines.data.filter((routine) => !assignedIds.has(routine.id));
  }, [routines, assignedIds]);

  const toggleDay = (day: string): void => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const canSubmit = selectedRoutine !== null && selectedDays.length > 0;

  const handleAssign = async (): Promise<void> => {
    if (!selectedRoutine) return;
    const orderedDays = DAYS.filter((day) => selectedDays.includes(day.value)).map((d) => d.value);
    await assignRoutine.mutateAsync({
      clientId: id,
      routine: selectedRoutine,
      schedule: orderedDays.join('/'),
    });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Asignar Rutina" centered onBack={() => router.back()} />

      {routines.status === 'loading' || client.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : routines.status === 'error' ? (
        <FeedbackState variant="error" message={routines.error} />
      ) : client.status === 'error' ? (
        <FeedbackState variant="error" message={client.error} />
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-5 px-5 pt-2 pb-6"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-2">
              <Text className="text-sm font-semibold text-ink">Rutina</Text>
              {availableRoutines.length === 0 ? (
                <Text className="text-sm text-ink-faint">
                  Este cliente ya tiene todas las rutinas del catálogo asignadas.
                </Text>
              ) : (
                <View className="gap-2">
                  {availableRoutines.map((routine) => {
                    const active = selectedRoutine?.id === routine.id;
                    return (
                      <Pressable
                        key={routine.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        onPress={() => setSelectedRoutine(routine)}
                        className={`flex-row items-center justify-between gap-2 rounded-2xl border p-3 ${
                          active ? 'border-primary bg-primary-light' : 'border-line bg-surface'
                        }`}
                      >
                        <View className="flex-1 gap-1">
                          <Text className="text-sm font-bold text-ink">{routine.name}</Text>
                          <Text className="text-xs text-ink-faint">
                            {routine.durationMin} min · {routine.exerciseCount} ejercicios
                          </Text>
                        </View>
                        <Badge label={ROUTINE_CATEGORY_LABEL[routine.category]} tone="primary" />
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-ink">Días</Text>
              <View className="flex-row gap-2">
                {DAYS.map((day) => {
                  const active = selectedDays.includes(day.value);
                  return (
                    <Pressable
                      key={day.value}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => toggleDay(day.value)}
                      className={`h-11 w-11 items-center justify-center rounded-full border ${
                        active ? 'border-primary bg-primary' : 'border-line bg-surface'
                      }`}
                    >
                      <Text className={`text-sm font-bold ${active ? 'text-white' : 'text-ink-muted'}`}>
                        {day.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View className="border-t border-line px-5 py-3">
            <Button
              label="Asignar"
              fullWidth
              disabled={!canSubmit}
              loading={assignRoutine.isPending}
              onPress={handleAssign}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
