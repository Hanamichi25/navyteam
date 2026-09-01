import { useAsyncData, type AsyncState } from '@/lib/useAsyncData';
import type { DashboardData } from '@/types/dashboard';
import { fetchMockDashboard } from '../mocks/dashboardData.mock';

/**
 * Carga los datos del dashboard.
 *
 * TODO(backend): en la Fase 3, `fetchMockDashboard` pasa por un Gateway y la
 * carga se hace con TanStack Query.
 */
export function useDashboardData(): AsyncState<DashboardData> {
  return useAsyncData(
    fetchMockDashboard,
    [],
    'No se pudieron cargar los datos del panel',
  );
}
