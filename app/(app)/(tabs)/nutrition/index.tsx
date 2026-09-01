import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipGroup } from '@/components/ChipGroup';
import { Fab } from '@/components/Fab';
import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import {
  NUTRITION_CATEGORY_FILTERS,
  NutritionPlanCard,
  useNutritionPlans,
  type NutritionCategoryFilter,
} from '@/features/nutrition';

export default function NutritionScreen(): React.JSX.Element {
  const router = useRouter();
  const plans = useNutritionPlans();
  const [category, setCategory] = useState<NutritionCategoryFilter>('all');

  const filtered = useMemo(() => {
    if (plans.status !== 'ready') return [];
    if (category === 'all') return plans.data;
    return plans.data.filter((plan) => plan.category === category);
  }, [plans, category]);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Planes de Alimentación"
        action={{
          iconName: 'options-outline',
          accessibilityLabel: 'Filtrar planes',
          onPress: () => {
            // TODO(backend): panel de filtros avanzados.
          },
        }}
      />

      <View className="pb-3">
        <ChipGroup
          options={NUTRITION_CATEGORY_FILTERS}
          value={category}
          onChange={setCategory}
        />
      </View>

      {plans.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : plans.status === 'error' ? (
        <FeedbackState variant="error" message={plans.error} />
      ) : filtered.length === 0 ? (
        <FeedbackState variant="empty" message="No hay planes en esta categoría." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(plan) => plan.id}
          contentContainerClassName="px-5 pb-24 gap-4"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <NutritionPlanCard
              plan={item}
              onPress={() => router.push(`/(app)/(tabs)/nutrition/${item.id}`)}
            />
          )}
        />
      )}

      <Fab
        accessibilityLabel="Crear plan de alimentación"
        onPress={() => router.push('/(app)/(tabs)/nutrition/new')}
      />
    </SafeAreaView>
  );
}
