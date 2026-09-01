/**
 * Tipos del dominio del dashboard del entrenador.
 *
 * La forma anticipa un futuro endpoint `GET /dashboard` del backend real.
 */

/** Tarjeta de métrica resumida (usuarios activos, rutinas creadas, etc.). */
export interface DashboardStat {
  id: string;
  /** Valor numérico grande que se muestra destacado. */
  value: number;
  /** Etiqueta corta debajo del número. */
  label: string;
}

/** Entrada del feed de actividad reciente. */
export interface ActivityItem {
  id: string;
  /** Nombre de la persona que generó la actividad. */
  actorName: string;
  actorAvatarUrl: string;
  /** Descripción de la acción, sin incluir el nombre (ej: "completó su rutina de piernas"). */
  action: string;
  /** Texto relativo ya formateado (ej: "Hace 10 min"). El backend real devolverá un timestamp. */
  timeAgo: string;
}

/** Modalidad de una sesión agendada. */
export type SessionMode = 'Presencial' | 'Online';

/** Sesión próxima con un cliente. */
export interface UpcomingSession {
  id: string;
  clientName: string;
  clientAvatarUrl: string;
  /** Hora de inicio en formato "HH:mm". */
  time: string;
  mode: SessionMode;
  /** Nombre del bloque de entrenamiento (ej: "Fuerza Tren Superior"). */
  focus: string;
}

/** Payload completo del dashboard para un entrenador. */
export interface DashboardData {
  stats: DashboardStat[];
  recentActivity: ActivityItem[];
  upcomingSessions: UpcomingSession[];
}
