import { useAsyncData, type AsyncState } from '@/lib/useAsyncData';
import type { Routine } from '@/types/routine';
import { fetchMockRoutines } from '../mocks/routines.mock';

/** Carga el catálogo de rutinas del entrenador. */
export function useRoutines(): AsyncState<Routine[]> {
  return useAsyncData(fetchMockRoutines, [], 'No se pudieron cargar las rutinas');
}
