/**
 * Tipos del dominio del dashboard del entrenador.
 *
 * La forma anticipa un futuro endpoint `GET /dashboard` del backend real.
 * TODO(backend): las métricas por periodo y el feed se derivarán de `clients`
 * + `workouts` en la Fase 9; hoy salen del seed mock.
 */

/** Tendencia de una métrica respecto al periodo anterior. */
export type StatTrend = 'up' | 'down' | 'flat';

/** Tarjeta de métrica del bloque "Resumen". */
export interface DashboardStat {
  /** Clave estable (ej: "sessions"); mapea a un icono en `labels.ts`. */
  id: string;
  /** Etiqueta corta debajo del número. */
  label: string;
  /** Valor numérico grande que se muestra destacado. */
  value: number;
  /** Variación absoluta respecto al periodo anterior del mismo tipo. */
  delta: number;
  trend: StatTrend;
}

/** Periodo sobre el que se calculan las métricas del "Resumen". */
export type DashboardPeriod = 'week' | 'month';

/** Tipo de entrada del feed de actividad reciente. */
export type ActivityKind = 'workout' | 'weight' | 'message';

/** Entrada del feed de actividad reciente. */
export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  /** Nombre de la persona que generó la actividad. */
  actorName: string;
  /** Id del cliente relacionado, si lo hay. */
  clientId?: string;
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
  clientId: string;
  clientName: string;
  clientAvatarUrl: string;
  /** Hora de inicio en formato "HH:mm". */
  time: string;
  mode: SessionMode;
  /** Nombre del bloque de entrenamiento (ej: "Fuerza Tren Superior"). */
  focus: string;
  /** Línea de contexto que se muestra al expandir la fila. */
  detail: string;
}

/** Payload completo del dashboard para un entrenador. */
export interface DashboardData {
  /** Nº de clientes activos, mostrado en el encabezado. */
  activeUsers: number;
  /** Métricas del "Resumen", una lista por periodo. */
  stats: Record<DashboardPeriod, DashboardStat[]>;
  recentActivity: ActivityItem[];
  upcomingSessions: UpcomingSession[];
}
