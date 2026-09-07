import { useQuery } from '@tanstack/react-query';

import { useDashboardGateway } from '@/gateways';
import { STALE_TIME } from '@/lib/queryClient';
import { toAsyncState, type AsyncState } from '@/lib/queryState';
import type { DashboardData } from '@/types/dashboard';

/** Carga los datos del dashboard. Se quiere fresco: `staleTime` 0 + pull-to-refresh en la pantalla. */
export function useDashboardData(): AsyncState<DashboardData> {
  const gateway = useDashboardGateway();
  return toAsyncState(
    useQuery({ queryKey: ['dashboard'], queryFn: gateway.get, staleTime: STALE_TIME.live }),
    'No se pudieron cargar los datos del panel',
  );
}
