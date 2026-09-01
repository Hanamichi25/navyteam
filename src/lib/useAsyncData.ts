import { useEffect, useState } from 'react';

/**
 * Estado de una carga asíncrona de datos de solo-lectura.
 *
 * TODO(backend): en la Fase 3 esto se reemplaza por TanStack Query (cache,
 * reintentos, refetch en background). La forma del estado se mantiene parecida.
 */
export type AsyncState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'ready'; data: T; error: null }
  | { status: 'error'; data: null; error: string };

const DEFAULT_ERROR = 'No se pudieron cargar los datos. Inténtalo de nuevo.';

/**
 * Ejecuta `fetcher` al montar (y cuando cambie una key de `deps`) y expone el
 * resultado como máquina de estados `loading | ready | error`.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[] = [],
  errorMessage: string = DEFAULT_ERROR,
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'loading',
    data: null,
    error: null,
  });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading', data: null, error: null });

    fetcher()
      .then((data) => {
        if (active) setState({ status: 'ready', data, error: null });
      })
      .catch(() => {
        if (active) setState({ status: 'error', data: null, error: errorMessage });
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
