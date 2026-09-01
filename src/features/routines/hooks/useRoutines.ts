import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useRoutinesGateway } from '@/gateways';
import { toAsyncState, type AsyncState } from '@/lib/queryState';
import type { Routine, RoutineDetail, RoutineInput } from '@/types/routine';

const routinesKey = ['routines'] as const;
const routineKey = (id: string) => ['routines', id] as const;

/** Carga el catálogo de rutinas del entrenador. */
export function useRoutines(): AsyncState<Routine[]> {
  const gateway = useRoutinesGateway();
  return toAsyncState(
    useQuery({ queryKey: routinesKey, queryFn: gateway.list }),
    'No se pudieron cargar las rutinas',
  );
}

/** Carga el detalle de una rutina por id (incluye sus bloques de ejercicio). */
export function useRoutine(id: string): AsyncState<RoutineDetail> {
  const gateway = useRoutinesGateway();
  return toAsyncState(
    useQuery({ queryKey: routineKey(id), queryFn: () => gateway.get(id) }),
    'No se pudo cargar la rutina',
  );
}

/** Crea una rutina nueva e invalida el catálogo. */
export function useCreateRoutine() {
  const gateway = useRoutinesGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RoutineInput) => gateway.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routinesKey });
    },
  });
}

/** Actualiza una rutina e invalida el catálogo y su detalle. */
export function useUpdateRoutine() {
  const gateway = useRoutinesGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<RoutineInput> }) =>
      gateway.update(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: routinesKey });
      queryClient.invalidateQueries({ queryKey: routineKey(variables.id) });
    },
  });
}

/** Elimina una rutina e invalida el catálogo. */
export function useRemoveRoutine() {
  const gateway = useRoutinesGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gateway.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routinesKey });
    },
  });
}
