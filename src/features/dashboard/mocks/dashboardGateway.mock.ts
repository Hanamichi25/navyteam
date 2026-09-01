import { delay } from '@/lib/delay';
import type { DashboardData } from '@/types/dashboard';
import type { DashboardGateway } from '../gateway';
import { DASHBOARD_DATA_SEED } from './dashboardData.mock';

const DASHBOARD_DELAY_MS = 600;

/**
 * Implementación mock del `DashboardGateway`. Sin persistencia: los datos
 * del dashboard son derivados de otras entidades, no una entidad editable.
 */
export function createMockDashboardGateway(): DashboardGateway {
  return {
    async get(): Promise<DashboardData> {
      await delay(DASHBOARD_DELAY_MS);
      return DASHBOARD_DATA_SEED;
    },
  };
}
