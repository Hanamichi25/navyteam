import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipGroup } from '@/components/ChipGroup';
import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchField } from '@/components/SearchField';
import {
  ExerciseListItem,
  MUSCLE_GROUP_FILTERS,
  useExercises,
  type MuscleGroupFilter,
} from '@/features/exercises';
import { COLORS } from '@/lib/colors';
import type { Exercise } from '@/types/exercise';

const NO_EXERCISES: readonly Exercise[] = [];

interface ExercisePickerModalProps {
  visible: boolean;
  /** Veces que cada ejercicio ya está en la rutina, por id. */
  countByExerciseId: Map<string, number>;
  onClose: () => void;
  onPick: (exerciseId: string) => void;
}

/** Minúsculas sin acentos, para una búsqueda tolerante. */
function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Selector de ejercicio del catálogo: búsqueda + filtro por grupo muscular. */
export function ExercisePickerModal({
  visible,
  countByExerciseId,
  onClose,
  onPick,
}: ExercisePickerModalProps): React.JSX.Element {
  const exercises = useExercises();
  const [query, setQuery] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroupFilter>('all');

  // `exercises` (de `toAsyncState`) es un objeto nuevo por render; `exercises.data`
  // sí es referencia estable de React Query.
  const all = exercises.status === 'ready' ? exercises.data : NO_EXERCISES;

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return all.filter((exercise) => {
      if (muscleGroup !== 'all' && exercise.muscleGroup !== muscleGroup) return false;
      if (q && !normalize(exercise.name).includes(q)) return false;
      return true;
    });
  }, [all, query, muscleGroup]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
        <ScreenHeader title="Añadir ejercicio" centered onBack={onClose} />

        <View className="gap-3 pb-3">
          <View className="px-5">
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar ejercicio"
            />
          </View>
          <ChipGroup
            options={MUSCLE_GROUP_FILTERS}
            value={muscleGroup}
            onChange={setMuscleGroup}
          />
        </View>

        {exercises.status === 'loading' ? (
          <FeedbackState variant="loading" />
        ) : exercises.status === 'error' ? (
          <FeedbackState variant="error" message={exercises.error} />
        ) : filtered.length === 0 ? (
          <FeedbackState
            variant="empty"
            message={
              all.length === 0
                ? 'Tu catálogo de ejercicios está vacío. Créalos desde el menú "Ejercicios".'
                : 'Ningún ejercicio coincide con la búsqueda.'
            }
          />
        ) : (
          <ScrollView
            contentContainerClassName="gap-3 px-5 pb-6"
            showsVerticalScrollIndicator={false}
          >
            {filtered.map((exercise) => {
              const count = countByExerciseId.get(exercise.id) ?? 0;
              return (
                <ExerciseListItem
                  key={exercise.id}
                  exercise={exercise}
                  onPress={() => onPick(exercise.id)}
                  rightSlot={
                    count > 0 ? (
                      <View className="rounded-full bg-primary-light px-2.5 py-1">
                        <Text className="text-xs font-bold text-primary">
                          {count > 1 ? `×${count}` : 'Añadido'}
                        </Text>
                      </View>
                    ) : (
                      <Ionicons name="add-circle" size={22} color={COLORS.primary} />
                    )
                  }
                />
              );
            })}

            <Text className="pt-1 text-center text-xs text-ink-faint">
              {filtered.length} de {all.length} ejercicios
            </Text>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}
