import { delay } from '@/lib/delay';
import { createId } from '@/lib/id';
import { readJSON, writeJSON } from '@/lib/storage';
import type { NutritionPlan, NutritionPlanInput } from '@/types/nutrition';
import type { NutritionGateway } from '../gateway';
import { NUTRITION_PLANS_SEED } from './nutritionPlans.mock';

const STORAGE_KEY = '@navyteam/nutrition';

/** Imagen de portada por defecto para planes creados desde el formulario. */
const PLACEHOLDER_IMAGE_SEEDS = ['salad', 'mealprep', 'bowl', 'recomp', 'greens', 'grains'];

async function readAll(): Promise<NutritionPlan[]> {
  return readJSON<NutritionPlan[]>(STORAGE_KEY, [...NUTRITION_PLANS_SEED]);
}

function placeholderImageUrl(): string {
  const seed = PLACEHOLDER_IMAGE_SEEDS[Math.floor(Math.random() * PLACEHOLDER_IMAGE_SEEDS.length)];
  return `https://picsum.photos/seed/navyteam-${seed}-${createId('img')}/640/360`;
}

/**
 * Implementación mock del `NutritionGateway`: persiste en AsyncStorage,
 * sembrando desde `nutritionPlans.mock.ts` la primera vez.
 */
export function createMockNutritionGateway(): NutritionGateway {
  return {
    async list() {
      await delay(600);
      return readAll();
    },

    async create(input: NutritionPlanInput) {
      await delay(600);
      const all = await readAll();
      // TODO(Fase 5): `imageUrl` lo elegirá el editor real; por ahora se asigna un placeholder.
      const plan: NutritionPlan = {
        ...input,
        id: createId('nut'),
        assignedCount: 0,
        imageUrl: placeholderImageUrl(),
      };
      await writeJSON(STORAGE_KEY, [...all, plan]);
      return plan;
    },

    async update(id, input) {
      await delay(600);
      const all = await readAll();
      const index = all.findIndex((plan) => plan.id === id);
      if (index === -1) {
        throw new Error(`Plan no encontrado: ${id}`);
      }
      const updated: NutritionPlan = { ...all[index]!, ...input };
      const next = [...all];
      next[index] = updated;
      await writeJSON(STORAGE_KEY, next);
      return updated;
    },

    async remove(id) {
      await delay(400);
      const all = await readAll();
      await writeJSON(
        STORAGE_KEY,
        all.filter((plan) => plan.id !== id),
      );
    },
  };
}
