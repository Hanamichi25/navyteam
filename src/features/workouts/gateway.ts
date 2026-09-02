import type {
  ClientTrainingSummary,
  ExerciseProgress,
  ExerciseTrainedSummary,
  WorkoutSession,
  WorkoutSessionInput,
  WorkoutSessionSummary,
} from '@/types/workout';

/**
 * Interfaz de infraestructura que necesita el módulo "entrenamientos".
 * TODO(backend): la implementación real (Fase 9) habla contra la API/BD; las
 * queries derivadas (`trainedExercises`, `exerciseProgress`, `trainingSummary`)
 * pasarían a ser agregaciones en servidor.
 */
export interface WorkoutsGateway {
  /** Historial de sesiones de un cliente, más reciente primero. */
  listByClient(clientId: string): Promise<WorkoutSessionSummary[]>;
  get(sessionId: string): Promise<WorkoutSession>;
  create(input: WorkoutSessionInput): Promise<WorkoutSession>;
  remove(sessionId: string): Promise<void>;
  /** Ejercicios que el cliente ha entrenado alguna vez, con su resumen. */
  trainedExercises(clientId: string): Promise<ExerciseTrainedSummary[]>;
  /** Serie temporal de progreso de un ejercicio para un cliente. */
  exerciseProgress(clientId: string, exerciseId: string): Promise<ExerciseProgress>;
  /** Resumen de adherencia del cliente (para la card del perfil). */
  trainingSummary(clientId: string): Promise<ClientTrainingSummary>;
}
