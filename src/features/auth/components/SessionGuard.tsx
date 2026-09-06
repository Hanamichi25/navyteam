import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { IDLE_TIMEOUT_MS, subscribeAuthGatewayEvents, useAuthStore } from '../store/authStore';

const WEB_ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;

/**
 * Cierra la sesión cuando corresponde, más allá del logout manual:
 * - **Fin externo**: el token caducó, se revocó desde otro dispositivo, o hubo
 *   logout en otra pestaña → `supabase-js` emite `SIGNED_OUT` y limpiamos.
 * - **Inactividad**: `IDLE_TIMEOUT_MS` sin interacción → `logout()` (que además
 *   revoca en el servidor). En web con eventos reales de actividad; en nativo,
 *   comprobando el tiempo en segundo plano al volver a primer plano.
 *
 * No renderiza nada. Se monta una vez en `app/_layout.tsx`.
 */
export function SessionGuard(): null {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => subscribeAuthGatewayEvents(), []);

  useEffect(() => {
    if (!user) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const fire = (): void => {
      void logout();
    };
    const arm = (): void => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(fire, IDLE_TIMEOUT_MS);
    };

    if (Platform.OS === 'web') {
      const onActivity = (): void => arm();
      WEB_ACTIVITY_EVENTS.forEach((e) =>
        window.addEventListener(e, onActivity, { passive: true }),
      );
      arm();
      return () => {
        WEB_ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
        if (timer) clearTimeout(timer);
      };
    }

    // Nativo: sin listener global de toques; se evalúa al volver de 2.º plano.
    let backgroundedAt: number | null = null;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        if (backgroundedAt !== null && Date.now() - backgroundedAt > IDLE_TIMEOUT_MS) {
          fire();
        }
        backgroundedAt = null;
      } else {
        backgroundedAt = Date.now();
      }
    });
    return () => sub.remove();
  }, [user, logout]);

  return null;
}
