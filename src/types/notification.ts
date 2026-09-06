/**
 * Tipos del dominio "notificaciones" (bandeja in-app + push).
 * Cada fila la crea un trigger de BD para el destinatario (`user_id`).
 */

export type NotificationKind =
  | 'message'
  | 'workout'
  | 'routine'
  | 'plan'
  | 'payment'
  | 'system';

/** Notificación tal como la consume la UI. */
export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** Payload de navegación: `{ type, clientId?, sessionId?, routineId?, planId? }`. */
  data: Record<string, unknown>;
  /** ISO 8601, o `null` si no está leída. */
  readAt: string | null;
  /** ISO 8601. */
  createdAt: string;
}
