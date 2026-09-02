import { Text, View } from 'react-native';

import type { WorkoutSession } from '@/types/workout';

interface SessionDetailViewProps {
  session: WorkoutSession;
}

/** Vista de solo lectura de una sesión registrada: series por ejercicio. */
export function SessionDetailView({
  session,
}: SessionDetailViewProps): React.JSX.Element {
  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-xl font-extrabold text-ink">{session.routineName}</Text>
        <Text className="text-sm text-ink-faint">{session.date}</Text>
      </View>

      {session.notes ? (
        <View className="rounded-2xl border border-line bg-surface-subtle p-4">
          <Text className="text-sm text-ink-muted">{session.notes}</Text>
        </View>
      ) : null}

      {session.exercises.map((log) => (
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
    </View>
  );
}
