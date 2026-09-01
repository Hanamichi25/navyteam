import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipGroup } from '@/components/ChipGroup';
import { Fab } from '@/components/Fab';
import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import {
  ExerciseListItem,
  MUSCLE_GROUP_FILTERS,
  useExercises,
  type MuscleGroupFilter,
} from '@/features/exercises';

export default function ExercisesScreen(): React.JSX.Element {
  const router = useRouter();
  const exercises = useExercises();
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroupFilter>('all');

  const filtered = useMemo(() => {
    if (exercises.status !== 'ready') return [];
    if (muscleGroup === 'all') return exercises.data;
    return exercises.data.filter((exercise) => exercise.muscleGroup === muscleGroup);
  }, [exercises, muscleGroup]);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Ejercicios" onBack={() => router.back()} />

      <View className="pb-3">
        <ChipGroup options={MUSCLE_GROUP_FILTERS} value={muscleGroup} onChange={setMuscleGroup} />
      </View>

      {exercises.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : exercises.status === 'error' ? (
        <FeedbackState variant="error" message={exercises.error} />
      ) : filtered.length === 0 ? (
        <FeedbackState variant="empty" message="No hay ejercicios en este grupo muscular." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(exercise) => exercise.id}
          contentContainerClassName="px-5 pb-24 gap-3"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ExerciseListItem
              exercise={item}
              onPress={() => router.push(`/(app)/exercises/${item.id}`)}
            />
          )}
        />
      )}

      <Fab
        accessibilityLabel="Crear ejercicio"
        onPress={() => router.push('/(app)/exercises/new')}
      />
    </SafeAreaView>
  );
}
