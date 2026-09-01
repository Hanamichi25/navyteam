/**
 * Tipos del dominio "rutinas".
 * La forma anticipa un endpoint tipo `GET /routines`.
 */

export type RoutineCategory = 'strength' | 'cardio' | 'flexibility';

export type RoutineLevel = 'beginner' | 'intermediate' | 'advanced';

/** Rutina del catálogo del entrenador. */
export interface Routine {
  id: string;
  name: string;
  category: RoutineCategory;
  level: RoutineLevel;
  durationMin: number;
  exerciseCount: number;
  /** Cuántos clientes tienen esta rutina asignada. */
  assignedCount: number;
  /** Imagen de portada (URL remota en esta fase). */
  imageUrl: string;
}
