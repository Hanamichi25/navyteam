/**
 * Tipos del dominio "clientes" (los usuarios que gestiona el entrenador).
 *
 * Se llama `Client` para no confundir con `User` (el entrenador autenticado).
 * La forma anticipa endpoints tipo `GET /clients` y `GET /clients/:id`.
 */

/** Objetivo de entrenamiento del cliente. */
export type ClientGoal = 'weight_loss' | 'muscle_gain' | 'maintenance';

/**
 * Estado de la suscripción, derivado de `subscriptionUntil` vs. hoy.
 * `expiring` = vigente pero a 7 días o menos de vencer.
 */
export type SubscriptionStatus = 'active' | 'expiring' | 'expired' | 'none';

/** Cliente tal como aparece en la lista "Mis Usuarios". */
export interface Client {
  id: string;
  name: string;
  avatarUrl: string;
  goal: ClientGoal;
  /** Texto relativo ya formateado (ej: "Activa hoy"). El backend devolverá un timestamp. */
  lastActivity: string;
  /**
   * Vigencia de la suscripción, `dd/mm/aaaa`, o `null` si nunca pagó. El
   * estado (`SubscriptionStatus`) se deriva con `subscriptionStatus()`.
   */
  subscriptionUntil: string | null;
}

/** Un pago de suscripción registrado por el entrenador. */
export interface Payment {
  id: string;
  /** Fecha del pago, `dd/mm/aaaa`. */
  date: string;
  amountEur: number;
  /** Meses de suscripción que cubre este pago. */
  months: number;
  /** Fecha hasta la que deja la suscripción vigente, `dd/mm/aaaa`. */
  coversUntil: string;
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

/** Plan de alimentación asignado a un cliente (resumen; como mucho uno a la vez). */
export interface AssignedNutritionPlan {
  id: string;
  name: string;
  kcalPerDay: number;
}

/**
 * Una medición corporal puntual (pesaje). El peso "vigente" del cliente
 * (`ClientDetail.weightKg`/`weightProgress.currentKg`) siempre refleja la
 * medición más reciente — no se edita a mano desde el formulario general.
 */
export interface BodyMeasurement {
  id: string;
  /** Texto en formato `dd/mm/aaaa`, igual que `DateField`. */
  date: string;
  weightKg: number;
  waistCm?: number;
  chestCm?: number;
  hipCm?: number;
  armCm?: number;
}

/**
 * Campos editables al crear/actualizar un cliente. `avatarUrl` y `lastActivity`
 * no forman parte del formulario: el Gateway los gestiona (mismo precedente que
 * `imageUrl` en `nutrition`/`routines`). El peso "actual" tampoco se edita acá,
 * ver `ClientsGateway.addMeasurement`.
 */
export interface ClientInput {
  name: string;
  goal: ClientGoal;
  email?: string;
  phone?: string;
  /** Texto en formato `dd/mm/aaaa`. */
  birthDate: string;
  heightCm: number;
  goalKg: number;
  /** Cuota mensual de la suscripción, en euros. */
  monthlyFeeEur: number;
  notes?: string;
}

/** Detalle completo de un cliente (pantalla "Perfil de Usuario"). */
export interface ClientDetail extends Client {
  /** Mes y año de alta (ej: "Ene 2025"). */
  memberSince: string;
  email?: string;
  phone?: string;
  /** Texto en formato `dd/mm/aaaa`. */
  birthDate: string;
  notes?: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  weightProgress: WeightProgress;
  /** Historial de pesajes, más reciente al final. Fuente de verdad de `weightKg`. */
  measurements: BodyMeasurement[];
  assignedRoutines: AssignedRoutine[];
  /** Plan de alimentación asignado, o `null` si no tiene ninguno. */
  assignedPlan: AssignedNutritionPlan | null;
  /** Cuota mensual de la suscripción, en euros. */
  monthlyFeeEur: number;
  /** Pagos registrados, más reciente al final. `subscriptionUntil` se hereda de `Client`. */
  payments: Payment[];
}
