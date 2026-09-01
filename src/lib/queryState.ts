import type { UseQueryResult } from '@tanstack/react-query';

/** Estado de una carga asíncrona de datos de solo-lectura. */
export type AsyncState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'ready'; data: T; error: null }
  | { status: 'error'; data: null; error: string };

const DEFAULT_ERROR = 'No se pudieron cargar los datos. Inténtalo de nuevo.';

/**
 * Adapta un resultado de `useQuery` a la máquina de estados `loading | ready
 * | error` que ya consumen las pantallas, para no tener que reescribirlas al
 * migrar los hooks de lectura a TanStack Query.
 */
export function toAsyncState<T>(
  query: UseQueryResult<T>,
  errorMessage: string = DEFAULT_ERROR,
): AsyncState<T> {
  if (query.isPending) return { status: 'loading', data: null, error: null };
  if (query.isError) return { status: 'error', data: null, error: errorMessage };
  return { status: 'ready', data: query.data, error: null };
}
