import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useExercisesGateway } from '@/gateways';
import { toAsyncState, type AsyncState } from '@/lib/queryState';
import type { Exercise, ExerciseInput } from '@/types/exercise';

const exercisesKey = ['exercises'] as const;

/** Carga el catálogo de ejercicios del entrenador. */
export function useExercises(): AsyncState<Exercise[]> {
  const gateway = useExercisesGateway();
  return toAsyncState(
    useQuery({ queryKey: exercisesKey, queryFn: gateway.list }),
    'No se pudieron cargar los ejercicios',
  );
}

/** Crea un ejercicio nuevo e invalida el catálogo. */
export function useCreateExercise() {
  const gateway = useExercisesGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ExerciseInput) => gateway.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exercisesKey });
    },
  });
}

/** Actualiza un ejercicio e invalida el catálogo. */
export function useUpdateExercise() {
  const gateway = useExercisesGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ExerciseInput> }) =>
      gateway.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exercisesKey });
    },
  });
}

/** Elimina un ejercicio e invalida el catálogo. */
export function useRemoveExercise() {
  const gateway = useExercisesGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gateway.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exercisesKey });
    },
  });
}
