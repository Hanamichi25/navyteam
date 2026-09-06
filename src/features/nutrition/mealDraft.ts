import { createId } from '@/lib/id';
import type { Meal, MealInput } from '@/types/nutrition';

/**
 * Tipos y helpers del borrador de comidas que maneja `NutritionPlanForm`
 * (patrón de `workouts/logging.ts`). La cantidad admite `null` mientras el
 * campo está vacío.
 */

export interface MealItemDraft {
  id: string;
  foodId: string;
  quantity: number | null;
}

export interface MealDraft {
  id: string;
  name: string;
  items: MealItemDraft[];
}

export const MEAL_NAME_SUGGESTIONS = [
  'Desayuno',
  'Media mañana',
  'Almuerzo',
  'Merienda',
  'Cena',
] as const;

/** Borrador inicial a partir del detalle de un plan existente. */
export function draftsFromMeals(meals: readonly Meal[]): MealDraft[] {
  return meals.map((meal) => ({
    id: meal.id,
    name: meal.name,
    items: meal.items.map((item) => ({
      id: item.id,
      foodId: item.foodId,
      quantity: item.quantity,
    })),
  }));
}

export function newMeal(name = ''): MealDraft {
  return { id: createId('meal'), name, items: [] };
}

export function newItem(foodId: string): MealItemDraft {
  return { id: createId('mi'), foodId, quantity: null };
}

/** Convierte el borrador a `MealInput[]`, descartando items sin cantidad y comidas vacías. */
export function draftsToInput(meals: readonly MealDraft[]): MealInput[] {
  return meals
    .map((meal) => ({
      name: meal.name.trim() || 'Comida',
      items: meal.items
        .filter((it) => it.quantity !== null && it.quantity > 0)
        .map((it) => ({ foodId: it.foodId, quantity: it.quantity as number })),
    }))
    .filter((meal) => meal.items.length > 0);
}
