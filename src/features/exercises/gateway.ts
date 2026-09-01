import type { Exercise, ExerciseInput } from '@/types/exercise';

/**
 * Interfaz de infraestructura que necesita el módulo "ejercicios".
 * TODO(backend): la implementación real (Fase 9) habla contra la API/BD.
 */
export interface ExercisesGateway {
  list(): Promise<Exercise[]>;
  create(input: ExerciseInput): Promise<Exercise>;
  update(id: string, input: Partial<ExerciseInput>): Promise<Exercise>;
  remove(id: string): Promise<void>;
}
