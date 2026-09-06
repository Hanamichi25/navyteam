import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDashboardGateway } from '@/gateways';

const dashboardKey = ['dashboard'] as const;

/** Oculta una entrada del feed o de los logros e invalida el panel. */
export function useDismissDashboardItem() {
  const gateway = useDashboardGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemKey: string) => gateway.dismiss(itemKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
  });
}

/** Vuelve a mostrar todas las entradas ocultadas. */
export function useRestoreDashboardItems() {
  const gateway = useDashboardGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => gateway.restoreDismissed(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKey });
    },
  });
}
