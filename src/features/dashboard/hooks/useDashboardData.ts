import { useEffect, useState } from 'react';

import type { DashboardData } from '@/types/dashboard';
import { fetchMockDashboard } from '../mocks/dashboardData.mock';

type DashboardState =
  | { status: 'loading'; data: null; error: null }
  | { status: 'ready'; data: DashboardData; error: null }
  | { status: 'error'; data: null; error: string };

/**
 * Carga los datos del dashboard desde el mock.
 *
 * TODO(backend): reemplazar `fetchMockDashboard` por TanStack Query contra el
 * endpoint real (cache, reintentos, refetch en background).
 */
export function useDashboardData(): DashboardState {
  const [state, setState] = useState<DashboardState>({
    status: 'loading',
    data: null,
    error: null,
  });

  useEffect(() => {
    let active = true;

    fetchMockDashboard()
      .then((data) => {
        if (active) setState({ status: 'ready', data, error: null });
      })
      .catch(() => {
        if (active) {
          setState({
            status: 'error',
            data: null,
            error: 'No se pudieron cargar los datos del panel',
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
