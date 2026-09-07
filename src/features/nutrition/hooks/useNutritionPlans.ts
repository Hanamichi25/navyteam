import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useNutritionGateway } from '@/gateways';
import { STALE_TIME } from '@/lib/queryClient';
import { toAsyncState, type AsyncState } from '@/lib/queryState';
import type { NutritionPlan, NutritionPlanDetail, NutritionPlanInput } from '@/types/nutrition';

const nutritionPlansKey = ['nutritionPlans'] as const;
const nutritionPlanKey = (id: string) => ['nutritionPlans', id] as const;

/** Carga el catálogo de planes de alimentación del entrenador. */
export function useNutritionPlans(): AsyncState<NutritionPlan[]> {
  const gateway = useNutritionGateway();
  return toAsyncState(
    useQuery({ queryKey: nutritionPlansKey, queryFn: gateway.list, staleTime: STALE_TIME.catalog }),
    'No se pudieron cargar los planes de alimentación',
  );
}

/** Carga el detalle de un plan (comidas + totales calculados). */
export function useNutritionPlan(id: string, enabled = true): AsyncState<NutritionPlanDetail> {
  const gateway = useNutritionGateway();
  return toAsyncState(
    useQuery({
      queryKey: nutritionPlanKey(id),
      queryFn: () => gateway.get(id),
      enabled: enabled && id !== '',
      staleTime: STALE_TIME.catalog,
    }),
    'No se pudo cargar el plan de alimentación',
  );
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>, id?: string): void {
  queryClient.invalidateQueries({ queryKey: nutritionPlansKey });
  if (id) queryClient.invalidateQueries({ queryKey: nutritionPlanKey(id) });
}

/** Crea un plan de alimentación nuevo e invalida el catálogo. */
export function useCreateNutritionPlan() {
  const gateway = useNutritionGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NutritionPlanInput) => gateway.create(input),
    onSuccess: () => invalidateAll(queryClient),
  });
}

/** Actualiza un plan de alimentación e invalida el catálogo y su detalle. */
export function useUpdateNutritionPlan() {
  const gateway = useNutritionGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<NutritionPlanInput> }) =>
      gateway.update(id, input),
    onSuccess: (_data, variables) => invalidateAll(queryClient, variables.id),
  });
}

/** Elimina un plan de alimentación e invalida el catálogo. */
export function useRemoveNutritionPlan() {
  const gateway = useNutritionGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gateway.remove(id),
    onSuccess: (_data, id) => invalidateAll(queryClient, id),
  });
}
