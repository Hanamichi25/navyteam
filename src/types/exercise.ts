/**
 * Tipos del dominio "ejercicios" (catálogo usado por el editor de rutinas).
 * La forma anticipa un endpoint tipo `GET /exercises`.
 */

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'cardio'
  | 'full_body';

/** Ejercicio del catálogo del entrenador. */
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  /** Equipo necesario, texto libre (ej: "Barra", "Peso corporal"). */
  equipment: string;
  description?: string;
  /** Imagen o video de referencia (URL remota). */
  mediaUrl?: string;
}

/** Campos editables al crear/actualizar un ejercicio. */
export type ExerciseInput = Omit<Exercise, 'id'>;
