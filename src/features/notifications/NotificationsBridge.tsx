import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useAuthStore } from '@/features/auth';
import { useNotificationsGateway } from '@/gateways';

import {
  addPushReceivedListener,
  addPushResponseListener,
  configurePushHandler,
  getDevicePushToken,
  getInitialPushResponse,
} from './push';
import { routeForNotification } from './labels';

configurePushHandler();

/**
 * Puente entre `expo-notifications` / Supabase Realtime y la app:
 * - registra el token de push del dispositivo al iniciar sesión y lo da de baja al salir,
 * - enruta al tocar una notificación (push o arranque en frío),
 * - refresca la bandeja cuando llega una notificación nueva (push en primer plano
 *   o INSERT en `notifications` vía Realtime — este último también en web).
 *
 * No renderiza nada.
 */
export function NotificationsBridge(): null {
  const user = useAuthStore((state) => state.user);
  const gateway = useNotificationsGateway();
  const router = useRouter();
  const queryClient = useQueryClient();
  const tokenRef = useRef<string | null>(null);

  const role = user?.role;

  // Enrutado por tap (push) + arranque en frío.
  useEffect(() => {
    const open = (data: Record<string, unknown>): void => {
      const target = routeForNotification(data, role);
      if (target) router.push(target as never);
    };
    getInitialPushResponse().then((data) => {
      if (data) open(data);
    });
    return addPushResponseListener(open);
  }, [role, router]);

  // Refresco de la bandeja al llegar una notificación en primer plano.
  useEffect(
    () =>
      addPushReceivedListener(() => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }),
    [queryClient],
  );

  // Registro / baja del token de push.
  useEffect(() => {
    if (!user) {
      const stale = tokenRef.current;
      if (stale) {
        tokenRef.current = null;
        gateway.unregisterToken(stale).catch(() => {});
      }
      return;
    }
    let cancelled = false;
    getDevicePushToken().then((result) => {
      if (cancelled || !result) return;
      tokenRef.current = result.token;
      gateway.registerToken(result.token, result.platform).catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, [user, gateway]);

  // Realtime: notificación nueva → refresca la bandeja (también en web).
  useEffect(() => {
    if (!user) return;
    return gateway.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
  }, [user, gateway, queryClient]);

  return null;
}
