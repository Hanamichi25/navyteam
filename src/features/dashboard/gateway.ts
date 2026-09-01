import type { DashboardData } from '@/types/dashboard';

/**
 * Interfaz de infraestructura que necesita el módulo "dashboard".
 * Solo lectura: los datos son derivados de otras entidades, no una entidad
 * editable en sí misma.
 * TODO(backend): la implementación real (Fase 9) habla contra la API/BD.
 */
export interface DashboardGateway {
  get(): Promise<DashboardData>;
}
