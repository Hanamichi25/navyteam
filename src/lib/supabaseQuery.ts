import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Helpers para consumir respuestas de `supabase-js` en los Gateways sin
 * repetir el chequeo de error en cada llamada.
 *
 * `supabase-js` nunca rechaza la promesa: devuelve `{ data, error }`. Estos
 * wrappers convierten `error` en un `throw` (React Query los captura y las
 * pantallas los muestran vía `toAsyncState`).
 */

interface PostgrestResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

/** Devuelve `data` o lanza si hubo error. `data` puede ser `null` (p.ej. listas vacías con `maybeSingle`). */
export function unwrap<T>(result: PostgrestResult<T>): T {
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data as T;
}

/** Como `unwrap`, pero además lanza `notFoundMessage` si `data` es `null`/`undefined`. */
export function unwrapRequired<T>(result: PostgrestResult<T>, notFoundMessage: string): NonNullable<T> {
  const data = unwrap(result);
  if (data === null || data === undefined) {
    throw new Error(notFoundMessage);
  }
  return data as NonNullable<T>;
}

/** Devuelve un array (nunca `null`) o lanza si hubo error. */
export function unwrapList<T>(result: PostgrestResult<T[]>): T[] {
  return unwrap(result) ?? [];
}
