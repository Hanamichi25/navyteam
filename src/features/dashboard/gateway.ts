import type { DashboardData } from '@/types/dashboard';

/**
 * Interfaz de infraestructura que necesita el módulo "dashboard".
 * Los datos son derivados; lo único editable es qué entradas oculta el
 * entrenador (`dismiss` / `restoreDismissed`).
 */
export interface DashboardGateway {
  get(): Promise<DashboardData>;
  /** Oculta una entrada del feed o de los logros (por su `id` estable). */
  dismiss(itemKey: string): Promise<void>;
  /** Vuelve a mostrar todas las entradas ocultadas. */
  restoreDismissed(): Promise<void>;
}
