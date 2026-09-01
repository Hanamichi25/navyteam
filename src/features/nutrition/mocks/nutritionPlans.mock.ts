import { delay } from '@/lib/delay';
import type { NutritionPlan } from '@/types/nutrition';

/**
 * Catálogo de planes de alimentación simulado.
 *
 * TODO(backend): reemplazar por `GET /nutrition-plans` filtrando por el entrenador.
 */

const PLANS: readonly NutritionPlan[] = [
  {
    id: 'nut_001',
    name: 'Plan Déficit Calórico',
    category: 'weight_loss',
    kcalPerDay: 1800,
    macros: { proteinPct: 30, carbsPct: 45, fatPct: 25 },
    assignedCount: 6,
    imageUrl: 'https://picsum.photos/seed/navyteam-salad/640/360',
  },
  {
    id: 'nut_002',
    name: 'Plan Volumen Limpio',
    category: 'volume',
    kcalPerDay: 3200,
    macros: { proteinPct: 30, carbsPct: 45, fatPct: 25 },
    assignedCount: 4,
    imageUrl: 'https://picsum.photos/seed/navyteam-mealprep/640/360',
  },
  {
    id: 'nut_003',
    name: 'Plan Mantenimiento Equilibrado',
    category: 'maintenance',
    kcalPerDay: 2400,
    macros: { proteinPct: 30, carbsPct: 45, fatPct: 25 },
    assignedCount: 2,
    imageUrl: 'https://picsum.photos/seed/navyteam-bowl/640/360',
  },
  {
    id: 'nut_004',
    name: 'Plan Recomposición',
    category: 'weight_loss',
    kcalPerDay: 2100,
    macros: { proteinPct: 35, carbsPct: 40, fatPct: 25 },
    assignedCount: 3,
    imageUrl: 'https://picsum.photos/seed/navyteam-recomp/640/360',
  },
];

export async function fetchMockNutritionPlans(): Promise<NutritionPlan[]> {
  // TODO(backend): sustituir por la llamada real.
  await delay(600);
  return [...PLANS];
}
