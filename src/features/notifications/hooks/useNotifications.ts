import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useNotificationsGateway } from '@/gateways';
import { STALE_TIME } from '@/lib/queryClient';
import { toAsyncState, type AsyncState } from '@/lib/queryState';
import type { AppNotification } from '@/types/notification';

const notificationsKey = ['notifications'] as const;

// La bandeja se quiere fresca: `staleTime` 0, refetch al volver el foco (aquí sí,
// contra el default global), y `NotificationsBridge` la invalida por Realtime/push.
const inboxQueryOptions = {
  queryKey: notificationsKey,
  staleTime: STALE_TIME.live,
  refetchOnWindowFocus: true,
} as const;

/** Bandeja del usuario en sesión (más recientes primero). */
export function useNotifications(): AsyncState<AppNotification[]> {
  const gateway = useNotificationsGateway();
  return toAsyncState(
    useQuery({ ...inboxQueryOptions, queryFn: gateway.list }),
    'No se pudieron cargar las notificaciones',
  );
}

/** Nº de notificaciones sin leer (0 mientras carga). */
export function useUnreadNotificationCount(): number {
  const gateway = useNotificationsGateway();
  const query = useQuery({ ...inboxQueryOptions, queryFn: gateway.list });
  return (query.data ?? []).filter((n) => n.readAt === null).length;
}

export function useMarkNotificationRead() {
  const gateway = useNotificationsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gateway.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsKey }),
  });
}

export function useMarkAllNotificationsRead() {
  const gateway = useNotificationsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => gateway.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsKey }),
  });
}

export function useDeleteNotification() {
  const gateway = useNotificationsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gateway.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsKey }),
  });
}
