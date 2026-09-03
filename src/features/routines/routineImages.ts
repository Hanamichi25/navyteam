import type { ImageSourcePropType } from 'react-native';

/**
 * Portadas de rutina incluidas en el bundle (`assets/routines/`, optimizadas
 * a ~1080 px). Sustituyen a los placeholders de `picsum.photos` que traía el
 * seed: no dependen de red y son estables.
 *
 * TODO(backend): en la Fase 10 el entrenador podrá subir su propia portada por
 * rutina; `Routine.imageUrl` se conserva para eso.
 */
// Rutas relativas a propósito: `require()` de un asset con el alias `@/` no es
// fiable en Metro (el alias se pensó para módulos, no para assets).
const BANNERS: readonly ImageSourcePropType[] = [
  require('../../assets/routines/legs.jpg'),
  require('../../assets/routines/back.jpg'),
  require('../../assets/routines/woman.jpg'),
  require('../../assets/routines/group.jpg'),
];

/** Suma de char codes del id → índice estable (misma rutina, misma portada). */
function hashIndex(routineId: string, modulo: number): number {
  let sum = 0;
  for (let i = 0; i < routineId.length; i += 1) sum += routineId.charCodeAt(i);
  return sum % modulo;
}

/** Portada estable para una rutina, a partir de su id. */
export function routineBanner(routineId: string): ImageSourcePropType {
  return BANNERS[hashIndex(routineId, BANNERS.length)] ?? BANNERS[0]!;
}
