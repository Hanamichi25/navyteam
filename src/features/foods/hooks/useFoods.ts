import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useFoodsGateway } from '@/gateways';
import { STALE_TIME } from '@/lib/queryClient';
import { toAsyncState, type AsyncState } from '@/lib/queryState';
import type { Food, FoodInput } from '@/types/food';

const foodsKey = ['foods'] as const;

/** Carga el catálogo de alimentos del entrenador. */
export function useFoods(): AsyncState<Food[]> {
  const gateway = useFoodsGateway();
  return toAsyncState(
    useQuery({ queryKey: foodsKey, queryFn: gateway.list, staleTime: STALE_TIME.catalog }),
    'No se pudieron cargar los alimentos',
  );
}

/** Crea un alimento nuevo e invalida el catálogo. */
export function useCreateFood() {
  const gateway = useFoodsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FoodInput) => gateway.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodsKey });
    },
  });
}

/** Actualiza un alimento e invalida el catálogo. */
export function useUpdateFood() {
  const gateway = useFoodsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<FoodInput> }) =>
      gateway.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodsKey });
    },
  });
}

/** Elimina un alimento e invalida el catálogo. */
export function useRemoveFood() {
  const gateway = useFoodsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gateway.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodsKey });
    },
  });
}
