import { useQuery } from '@tanstack/react-query';

import { useDashboardGateway } from '@/gateways';
import { toAsyncState, type AsyncState } from '@/lib/queryState';
import type { DashboardData } from '@/types/dashboard';

/** Carga los datos del dashboard. */
export function useDashboardData(): AsyncState<DashboardData> {
  const gateway = useDashboardGateway();
  return toAsyncState(
    useQuery({ queryKey: ['dashboard'], queryFn: gateway.get }),
    'No se pudieron cargar los datos del panel',
  );
}
