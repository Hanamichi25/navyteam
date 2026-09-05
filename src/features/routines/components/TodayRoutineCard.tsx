import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { AssignedRoutine } from '@/types/client';
import { COLORS } from '@/lib/colors';
import { weekdayIndexMonday, weekdayNameEs } from '@/lib/date';
import { nextTrainingWeekday, scheduleTrainsOn } from '@/lib/schedule';

import { AssignedRoutineView } from './AssignedRoutineView';

interface TodayRoutineCardProps {
  assignedRoutines: AssignedRoutine[];
  /** Si se pasa, muestra el botón "Iniciar entreno" para la rutina del día. */
  onStartWorkout?: (routineId: string) => void;
}

/** Bloque "Hoy te toca": la rutina del día (o descanso) con sus ejercicios plegables. */
export function TodayRoutineCard({
  assignedRoutines,
  onStartWorkout,
}: TodayRoutineCardProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const today = weekdayIndexMonday();
  const weekday = weekdayNameEs(today);

  const todays = assignedRoutines.filter((routine) =>
    scheduleTrainsOn(routine.schedule, today),
  );

  if (todays.length === 0) {
    const nextIndex = nextTrainingWeekday(
      assignedRoutines.map((r) => r.schedule),
      today,
    );
    return (
      <View className="gap-1.5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <Text className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Hoy · {weekday}
        </Text>
        <Text className="text-xl font-extrabold text-ink">Hoy descansas</Text>
        {nextIndex !== null ? (
          <Text className="text-sm text-ink-muted">
            Tu próximo entreno es el {weekdayNameEs(nextIndex)}.
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View className="gap-3 rounded-2xl border border-primary-light bg-primary-light p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-wide text-primary">
          Hoy · {weekday}
        </Text>
        <View className="rounded-full bg-emerald-100 px-2 py-0.5">
          <Text className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Entreno
          </Text>
        </View>
      </View>

      {todays.map((routine) => (
        <Text key={routine.id} className="text-xl font-extrabold text-ink">
          {routine.name}
        </Text>
      ))}

      {onStartWorkout
        ? todays.map((routine) => (
            <Pressable
              key={routine.id}
              accessibilityRole="button"
              accessibilityLabel={`Iniciar entreno: ${routine.name}`}
              onPress={() => onStartWorkout(routine.id)}
              className="h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-primary active:bg-primary-dark"
            >
              <Ionicons name="play" size={16} color="#FFFFFF" />
              <Text className="text-sm font-bold text-white">
                {todays.length > 1 ? `Iniciar ${routine.name}` : 'Iniciar entreno'}
              </Text>
            </Pressable>
          ))
        : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        className="flex-row items-center gap-1.5 self-center py-1"
      >
        <Text className="text-xs font-bold text-primary">
          {expanded ? 'Ocultar ejercicios' : 'Ver ejercicios'}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={COLORS.primary}
        />
      </Pressable>

      {expanded ? (
        <View className="gap-4">
          {todays.map((routine) => (
            <AssignedRoutineView key={routine.id} routineId={routine.id} hideHeader />
          ))}
        </View>
      ) : null}
    </View>
  );
}
