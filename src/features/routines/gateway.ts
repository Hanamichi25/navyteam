import type { Routine, RoutineDetail, RoutineInput } from '@/types/routine';

/**
 * Interfaz de infraestructura que necesita el módulo "rutinas".
 * TODO(backend): la implementación real (Fase 9) habla contra la API/BD.
 */
export interface RoutinesGateway {
  list(): Promise<Routine[]>;
  get(id: string): Promise<RoutineDetail>;
  create(input: RoutineInput): Promise<RoutineDetail>;
  update(id: string, input: Partial<RoutineInput>): Promise<RoutineDetail>;
  remove(id: string): Promise<void>;
}
