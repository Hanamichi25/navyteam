import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipGroup } from '@/components/ChipGroup';
import { Fab } from '@/components/Fab';
import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import {
  ROUTINE_CATEGORY_FILTERS,
  RoutineCard,
  useRoutines,
  type RoutineCategoryFilter,
} from '@/features/routines';

export default function RoutinesScreen(): React.JSX.Element {
  const routines = useRoutines();
  const [category, setCategory] = useState<RoutineCategoryFilter>('all');

  const filtered = useMemo(() => {
    if (routines.status !== 'ready') return [];
    if (category === 'all') return routines.data;
    return routines.data.filter((routine) => routine.category === category);
  }, [routines, category]);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Rutinas"
        action={{
          iconName: 'options-outline',
          accessibilityLabel: 'Filtrar rutinas',
          onPress: () => {
            // TODO(backend): panel de filtros avanzados.
          },
        }}
      />

      <View className="pb-3">
        <ChipGroup
          options={ROUTINE_CATEGORY_FILTERS}
          value={category}
          onChange={setCategory}
        />
      </View>

      {routines.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : routines.status === 'error' ? (
        <FeedbackState variant="error" message={routines.error} />
      ) : filtered.length === 0 ? (
        <FeedbackState
          variant="empty"
          message="No hay rutinas en esta categoría."
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(routine) => routine.id}
          contentContainerClassName="px-5 pb-24 gap-4"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <RoutineCard routine={item} />}
        />
      )}

      <Fab
        accessibilityLabel="Crear rutina"
        onPress={() => {
          // TODO(backend): abrir editor de rutinas (Fase 5).
        }}
      />
    </SafeAreaView>
  );
}
