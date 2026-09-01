import { useAsyncData, type AsyncState } from '@/lib/useAsyncData';
import type { NutritionPlan } from '@/types/nutrition';
import { fetchMockNutritionPlans } from '../mocks/nutritionPlans.mock';

/** Carga el catálogo de planes de alimentación del entrenador. */
export function useNutritionPlans(): AsyncState<NutritionPlan[]> {
  return useAsyncData(
    fetchMockNutritionPlans,
    [],
    'No se pudieron cargar los planes de alimentación',
  );
}
