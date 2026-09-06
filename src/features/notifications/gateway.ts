import type { AppNotification } from '@/types/notification';

/**
 * Puerto de infraestructura para la bandeja de notificaciones y el registro
 * de tokens de push. La implementación real (`supabase/`) habla con las tablas
 * `notifications` y `push_tokens`.
 */
export interface NotificationsGateway {
  /** Notificaciones del usuario en sesión, más recientes primero. */
  list(): Promise<AppNotification[]>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
  remove(id: string): Promise<void>;
  /** Alta/refresco del token de push del dispositivo actual. */
  registerToken(token: string, platform: string): Promise<void>;
  /** Baja del token (logout). */
  unregisterToken(token: string): Promise<void>;
  /**
   * Avisa cuando llega una notificación nueva para el usuario en sesión (la RLS
   * ya limita el stream a lo suyo). Devuelve la función para cancelar.
   */
  subscribe(onChange: () => void): () => void;
}
