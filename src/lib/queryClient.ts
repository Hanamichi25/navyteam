import { QueryClient } from '@tanstack/react-query';

/**
 * `staleTime` por tipo de dato (ms). Una query es "fresca" hasta que pasa este
 * tiempo desde el último fetch: mientras lo sea, montar una pantalla que la usa
 * NO dispara una consulta nueva. Las mutaciones siguen invalidando su
 * `queryKey` explícitamente (patrón de la Fase 3), así que subir estos valores
 * no vuelve la UI obsoleta tras un cambio propio.
 *
 * - `catalog`: ejercicios / alimentos / rutinas / planes del coach. Cambian
 *   poco y solo desde esta misma app → toleran minutos.
 * - `default`: clientes, hilos de mensajes, historial de entrenos. Datos que el
 *   coach edita seguido; 30 s evita el refetch por montaje repetido sin que se
 *   sienta viejo.
 * - `live`: dashboard y notificaciones. Se quiere lo más fresco posible; el
 *   pull-to-refresh y el Realtime (`NotificationsBridge`) hacen el resto.
 */
export const STALE_TIME = {
  catalog: 5 * 60 * 1000,
  default: 30 * 1000,
  live: 0,
} as const;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME.default,
        gcTime: 5 * 60 * 1000,
        // El pull-to-refresh y las invalidaciones tras mutación cubren la
        // frescura; el refetch al volver el foco (sobre todo en web, con cada
        // cambio de pestaña) es tráfico y evaluaciones de RLS de más.
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}
