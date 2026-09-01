/**
 * Tipos del dominio "clientes" (los usuarios que gestiona el entrenador).
 *
 * Se llama `Client` para no confundir con `User` (el entrenador autenticado).
 * La forma anticipa endpoints tipo `GET /clients` y `GET /clients/:id`.
 */

/** Objetivo de entrenamiento del cliente. */
export type ClientGoal = 'weight_loss' | 'muscle_gain' | 'maintenance';

/** Cliente tal como aparece en la lista "Mis Usuarios". */
export interface Client {
  id: string;
  name: string;
  avatarUrl: string;
  goal: ClientGoal;
  /** Texto relativo ya formateado (ej: "Activa hoy"). El backend devolverá un timestamp. */
  lastActivity: string;
}

/** Progreso de peso mostrado en el perfil del cliente. */
export interface WeightProgress {
  startKg: number;
  currentKg: number;
  goalKg: number;
}

/** Rutina asignada a un cliente (resumen). */
export interface AssignedRoutine {
  id: string;
  name: string;
  /** Días de la semana en formato corto (ej: "Lun/Mié/Vie"). */
  schedule: string;
  exerciseCount: number;
  durationMin: number;
}

/** Detalle completo de un cliente (pantalla "Perfil de Usuario"). */
export interface ClientDetail extends Client {
  /** Mes y año de alta (ej: "Ene 2025"). */
  memberSince: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  weightProgress: WeightProgress;
  assignedRoutines: AssignedRoutine[];
  /** Nombre del plan de alimentación asignado, o `null` si no tiene. */
  assignedPlanName: string | null;
}
