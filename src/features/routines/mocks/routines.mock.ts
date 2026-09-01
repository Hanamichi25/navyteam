import { delay } from '@/lib/delay';
import type { Routine } from '@/types/routine';

/**
 * Catálogo de rutinas simulado.
 *
 * TODO(backend): reemplazar por `GET /routines` filtrando por el entrenador.
 */

const ROUTINES: readonly Routine[] = [
  {
    id: 'rtn_001',
    name: 'Piernas y Glúteos',
    category: 'strength',
    level: 'intermediate',
    durationMin: 45,
    exerciseCount: 8,
    assignedCount: 5,
    imageUrl: 'https://picsum.photos/seed/navyteam-legs/640/360',
  },
  {
    id: 'rtn_002',
    name: 'Cardio HIIT',
    category: 'cardio',
    level: 'intermediate',
    durationMin: 20,
    exerciseCount: 5,
    assignedCount: 8,
    imageUrl: 'https://picsum.photos/seed/navyteam-hiit/640/360',
  },
  {
    id: 'rtn_003',
    name: 'Fuerza Superior',
    category: 'strength',
    level: 'advanced',
    durationMin: 50,
    exerciseCount: 10,
    assignedCount: 3,
    imageUrl: 'https://picsum.photos/seed/navyteam-upper/640/360',
  },
  {
    id: 'rtn_004',
    name: 'Flexibilidad Total',
    category: 'flexibility',
    level: 'beginner',
    durationMin: 30,
    exerciseCount: 6,
    assignedCount: 4,
    imageUrl: 'https://picsum.photos/seed/navyteam-flex/640/360',
  },
  {
    id: 'rtn_005',
    name: 'Cardio Quema Grasa',
    category: 'cardio',
    level: 'beginner',
    durationMin: 35,
    exerciseCount: 7,
    assignedCount: 6,
    imageUrl: 'https://picsum.photos/seed/navyteam-fatburn/640/360',
  },
];

export async function fetchMockRoutines(): Promise<Routine[]> {
  // TODO(backend): sustituir por la llamada real.
  await delay(600);
  return [...ROUTINES];
}
