/**
 * Tipos del dominio "rutinas".
 * La forma anticipa un endpoint tipo `GET /routines`.
 */

export type RoutineCategory = 'strength' | 'cardio' | 'flexibility';

export type RoutineLevel = 'beginner' | 'intermediate' | 'advanced';

/** Rutina del catálogo del entrenador (resumen, como aparece en la lista). */
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

/** Campos editables de un bloque de ejercicio dentro de una rutina. */
export interface RoutineBlockInput {
  exerciseId: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  /** Carga sugerida, texto libre (ej: "20 kg", "Peso corporal", "RPE 8"). */
  suggestedLoad: string;
  restSec: number;
}

/** Bloque de ejercicio dentro de una rutina, con orden implícito en el array. */
export interface RoutineBlock extends RoutineBlockInput {
  id: string;
}

/** Detalle completo de una rutina (pantalla de edición). */
export interface RoutineDetail extends Routine {
  blocks: RoutineBlock[];
}

/**
 * Campos editables al crear/actualizar una rutina.
 * `imageUrl` lo asigna el Gateway (placeholder); `exerciseCount` se deriva
 * de `blocks.length`.
 */
export type RoutineInput = Omit<RoutineDetail, 'id' | 'assignedCount' | 'exerciseCount' | 'imageUrl'>;
