/**
 * Tipos del dominio "entrenamientos" (Fase 7).
 *
 * El entrenador registra desde el panel lo que hizo cada cliente en cada
 * sesión: series/reps/peso por ejercicio. La app deriva de ahí el seguimiento
 * de progreso (progresión de carga, volumen, PRs) y el resumen de adherencia.
 *
 * La forma anticipa endpoints tipo `GET /clients/:id/sessions` y
 * `GET /sessions/:id`.
 */

/** Una serie registrada de un ejercicio. */
export interface SetLog {
  /** Nº de serie dentro del ejercicio (1-indexado). */
  setNumber: number;
  reps: number;
  weightKg: number;
  /** Esfuerzo percibido (1-10), opcional. */
  rpe?: number;
}

/** Registro de un ejercicio dentro de una sesión, con su lista de series. */
export interface ExerciseLog {
  id: string;
  exerciseId: string;
  /** Nombre denormalizado del ejercicio al momento de registrar. */
  exerciseName: string;
  sets: SetLog[];
}

/** Sesión de entrenamiento completa (pantalla de detalle). */
export interface WorkoutSession {
  id: string;
  clientId: string;
  routineId: string;
  /** Nombre denormalizado de la rutina al momento de registrar. */
  routineName: string;
  /** Texto en formato `dd/mm/aaaa`, igual que `DateField` / `BodyMeasurement`. */
  date: string;
  /** Duración en minutos (entero), si se cronometró el entreno. */
  durationMin?: number;
  notes?: string;
  exercises: ExerciseLog[];
}

/**
 * Sesión tal como aparece en el historial del cliente (resumen).
 * Misma división lista/detalle que `Client`/`Routine`.
 */
export interface WorkoutSessionSummary {
  id: string;
  clientId: string;
  date: string;
  routineName: string;
  exerciseCount: number;
  setCount: number;
  /** Volumen total = Σ reps × peso de todas las series. */
  totalVolumeKg: number;
  /** Duración en minutos (entero), si se cronometró el entreno. */
  durationMin?: number;
}

/** Campos que llegan al `create()` de una sesión. */
export interface WorkoutSessionInput {
  clientId: string;
  routineId: string;
  routineName: string;
  /** Texto en formato `dd/mm/aaaa`. */
  date: string;
  /** Duración en minutos (entero), si se cronometró el entreno. */
  durationMin?: number;
  notes?: string;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: SetLog[];
  }[];
}

/** Un punto de la serie temporal de progreso de un ejercicio (uno por sesión). */
export interface ExerciseProgressPoint {
  /** Fecha de la sesión, `dd/mm/aaaa`. */
  date: string;
  /** Peso más alto levantado en esa sesión para este ejercicio. */
  topWeightKg: number;
  /** Volumen del ejercicio en esa sesión (Σ reps × peso). */
  totalVolumeKg: number;
  /** 1RM estimado (fórmula de Epley) de la mejor serie de esa sesión. */
  estimated1RM: number;
}

/** Progreso completo de un ejercicio para un cliente. */
export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  /** Puntos ordenados por fecha ascendente. */
  points: ExerciseProgressPoint[];
  /** Récords personales sobre toda la historia registrada. */
  prWeightKg: number;
  prVolumeKg: number;
  prEstimated1RM: number;
}

/** Resumen de un ejercicio entrenado por el cliente (lista "Progreso por ejercicio"). */
export interface ExerciseTrainedSummary {
  exerciseId: string;
  exerciseName: string;
  sessionCount: number;
  /** Fecha de la última sesión que incluyó este ejercicio, `dd/mm/aaaa`. */
  lastDate: string;
  bestWeightKg: number;
}

/**
 * Resumen de entrenamiento/adherencia del cliente (card del perfil).
 * Sin porcentaje de adherencia: no hay agenda real de sesiones esperadas.
 */
export interface ClientTrainingSummary {
  totalSessions: number;
  sessionsThisMonth: number;
  /** Fecha de la última sesión, `dd/mm/aaaa`, o `null` si nunca entrenó. */
  lastSessionDate: string | null;
  /** Semanas consecutivas (hasta hoy) con al menos una sesión registrada. */
  currentStreakWeeks: number;
}
