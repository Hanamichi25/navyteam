import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useWorkoutsGateway } from '@/gateways';
import { toAsyncState, type AsyncState } from '@/lib/queryState';
import type {
  ClientTrainingSummary,
  ExerciseProgress,
  ExerciseTrainedSummary,
  WorkoutSession,
  WorkoutSessionInput,
  WorkoutSessionSummary,
} from '@/types/workout';

/** Todo lo de un cliente cuelga de este prefijo → una invalidación lo cubre todo. */
const clientWorkoutsKey = (clientId: string) => ['workouts', clientId] as const;
const sessionKey = (id: string) => ['workout', id] as const;

/** Historial de sesiones del cliente (más reciente primero). */
export function useClientWorkouts(clientId: string): AsyncState<WorkoutSessionSummary[]> {
  const gateway = useWorkoutsGateway();
  return toAsyncState(
    useQuery({
      queryKey: clientWorkoutsKey(clientId),
      queryFn: () => gateway.listByClient(clientId),
    }),
    'No se pudo cargar el historial de entrenamientos',
  );
}

/** Detalle de una sesión por id. */
export function useWorkoutSession(id: string): AsyncState<WorkoutSession> {
  const gateway = useWorkoutsGateway();
  return toAsyncState(
    useQuery({ queryKey: sessionKey(id), queryFn: () => gateway.get(id) }),
    'No se pudo cargar la sesión',
  );
}

/** Ejercicios entrenados por el cliente, con resumen. */
export function useTrainedExercises(clientId: string): AsyncState<ExerciseTrainedSummary[]> {
  const gateway = useWorkoutsGateway();
  return toAsyncState(
    useQuery({
      queryKey: [...clientWorkoutsKey(clientId), 'trained'],
      queryFn: () => gateway.trainedExercises(clientId),
    }),
    'No se pudo cargar el progreso por ejercicio',
  );
}

/** Serie temporal de progreso de un ejercicio para el cliente. */
export function useExerciseProgress(
  clientId: string,
  exerciseId: string,
): AsyncState<ExerciseProgress> {
  const gateway = useWorkoutsGateway();
  return toAsyncState(
    useQuery({
      queryKey: [...clientWorkoutsKey(clientId), 'progress', exerciseId],
      queryFn: () => gateway.exerciseProgress(clientId, exerciseId),
    }),
    'No se pudo cargar el progreso del ejercicio',
  );
}

/** Resumen de adherencia del cliente (card del perfil). */
export function useClientTrainingSummary(clientId: string): AsyncState<ClientTrainingSummary> {
  const gateway = useWorkoutsGateway();
  return toAsyncState(
    useQuery({
      queryKey: [...clientWorkoutsKey(clientId), 'summary'],
      queryFn: () => gateway.trainingSummary(clientId),
    }),
    'No se pudo cargar el resumen de entrenamiento',
  );
}

/** Registra una sesión nueva e invalida todo lo del cliente. */
export function useCreateWorkoutSession() {
  const gateway = useWorkoutsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkoutSessionInput) => gateway.create(input),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: clientWorkoutsKey(input.clientId) });
    },
  });
}

/** Elimina una sesión e invalida todo lo del cliente. */
export function useRemoveWorkoutSession() {
  const gateway = useWorkoutsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId }: { sessionId: string; clientId: string }) =>
      gateway.remove(sessionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientWorkoutsKey(variables.clientId) });
      queryClient.removeQueries({ queryKey: sessionKey(variables.sessionId) });
    },
  });
}
