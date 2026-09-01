import type { RoutineDetail } from '@/types/routine';

/**
 * Datos semilla de rutinas, usados por `routinesGateway.mock.ts` para
 * sembrar AsyncStorage la primera vez que se lee. Cada rutina trae 2
 * bloques de ejemplo referenciando ejercicios de `exercises.mock.ts`.
 *
 * TODO(backend): estos datos desaparecen al conectar el backend real (Fase 9).
 */
export const ROUTINES_SEED: readonly RoutineDetail[] = [
  {
    id: 'rtn_001',
    name: 'Piernas y Glúteos',
    category: 'strength',
    level: 'intermediate',
    durationMin: 45,
    exerciseCount: 2,
    assignedCount: 5,
    imageUrl: 'https://picsum.photos/seed/navyteam-legs/640/360',
    blocks: [
      { id: 'blk_001', exerciseId: 'exc_squat', sets: 4, repsMin: 8, repsMax: 10, suggestedLoad: '40 kg', restSec: 90 },
      { id: 'blk_002', exerciseId: 'exc_lunges', sets: 3, repsMin: 10, repsMax: 12, suggestedLoad: '12 kg', restSec: 60 },
    ],
  },
  {
    id: 'rtn_002',
    name: 'Cardio HIIT',
    category: 'cardio',
    level: 'intermediate',
    durationMin: 20,
    exerciseCount: 2,
    assignedCount: 8,
    imageUrl: 'https://picsum.photos/seed/navyteam-hiit/640/360',
    blocks: [
      { id: 'blk_003', exerciseId: 'exc_burpees', sets: 4, repsMin: 12, repsMax: 15, suggestedLoad: 'Peso corporal', restSec: 45 },
      { id: 'blk_004', exerciseId: 'exc_treadmill', sets: 1, repsMin: 1, repsMax: 1, suggestedLoad: 'RPE 8', restSec: 0 },
    ],
  },
  {
    id: 'rtn_003',
    name: 'Fuerza Superior',
    category: 'strength',
    level: 'advanced',
    durationMin: 50,
    exerciseCount: 2,
    assignedCount: 3,
    imageUrl: 'https://picsum.photos/seed/navyteam-upper/640/360',
    blocks: [
      { id: 'blk_005', exerciseId: 'exc_bench_press', sets: 5, repsMin: 5, repsMax: 6, suggestedLoad: '60 kg', restSec: 120 },
      { id: 'blk_006', exerciseId: 'exc_barbell_row', sets: 4, repsMin: 6, repsMax: 8, suggestedLoad: '50 kg', restSec: 90 },
    ],
  },
  {
    id: 'rtn_004',
    name: 'Flexibilidad Total',
    category: 'flexibility',
    level: 'beginner',
    durationMin: 30,
    exerciseCount: 2,
    assignedCount: 4,
    imageUrl: 'https://picsum.photos/seed/navyteam-flex/640/360',
    blocks: [
      { id: 'blk_007', exerciseId: 'exc_plank', sets: 3, repsMin: 1, repsMax: 1, suggestedLoad: '30 seg', restSec: 30 },
      { id: 'blk_008', exerciseId: 'exc_lunges', sets: 2, repsMin: 10, repsMax: 10, suggestedLoad: 'Peso corporal', restSec: 30 },
    ],
  },
  {
    id: 'rtn_005',
    name: 'Cardio Quema Grasa',
    category: 'cardio',
    level: 'beginner',
    durationMin: 35,
    exerciseCount: 2,
    assignedCount: 6,
    imageUrl: 'https://picsum.photos/seed/navyteam-fatburn/640/360',
    blocks: [
      { id: 'blk_009', exerciseId: 'exc_treadmill', sets: 1, repsMin: 1, repsMax: 1, suggestedLoad: 'RPE 6', restSec: 0 },
      { id: 'blk_010', exerciseId: 'exc_burpees', sets: 3, repsMin: 10, repsMax: 12, suggestedLoad: 'Peso corporal', restSec: 60 },
    ],
  },
];
