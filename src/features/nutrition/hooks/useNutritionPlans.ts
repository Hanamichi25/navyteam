import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useNutritionGateway } from '@/gateways';
import { toAsyncState, type AsyncState } from '@/lib/queryState';
import type { NutritionPlan, NutritionPlanInput } from '@/types/nutrition';

const nutritionPlansKey = ['nutritionPlans'] as const;

/** Carga el catálogo de planes de alimentación del entrenador. */
export function useNutritionPlans(): AsyncState<NutritionPlan[]> {
  const gateway = useNutritionGateway();
  return toAsyncState(
    useQuery({ queryKey: nutritionPlansKey, queryFn: gateway.list }),
    'No se pudieron cargar los planes de alimentación',
  );
}

/** Crea un plan de alimentación nuevo e invalida el catálogo. */
export function useCreateNutritionPlan() {
  const gateway = useNutritionGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NutritionPlanInput) => gateway.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionPlansKey });
    },
  });
}

/** Actualiza un plan de alimentación e invalida el catálogo. */
export function useUpdateNutritionPlan() {
  const gateway = useNutritionGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<NutritionPlanInput> }) =>
      gateway.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionPlansKey });
    },
  });
}

/** Elimina un plan de alimentación e invalida el catálogo. */
export function useRemoveNutritionPlan() {
  const gateway = useNutritionGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gateway.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionPlansKey });
    },
  });
}
