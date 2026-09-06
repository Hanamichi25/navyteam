/**
 * Lógica pura del cálculo de calorías y macros de un plan de alimentación a
 * partir de sus comidas y del catálogo de alimentos. Sin I/O ni React: la
 * reutilizan el mock y el Gateway Supabase (traen filas crudas y calculan en
 * cliente), igual que `workouts/progress.ts`.
 */

import type { Food } from '@/types/food';
import type {
  Macros,
  MacroGrams,
  Meal,
  MealItem,
  MealItemInput,
  NutritionCategory,
  NutritionPlan,
  NutritionPlanDetail,
  NutritionTotals,
} from '@/types/nutrition';

const EMPTY_GRAMS: MacroGrams = { proteinG: 0, carbsG: 0, fatG: 0 };
const EMPTY_MACROS: Macros = { proteinPct: 0, carbsPct: 0, fatPct: 0 };

function round(value: number): number {
  return Math.round(value);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Reparto porcentual de macros a partir de sus gramos (P·4, C·4, G·9 kcal/g). */
export function gramsToMacroPct(grams: MacroGrams): Macros {
  const pKcal = grams.proteinG * 4;
  const cKcal = grams.carbsG * 4;
  const fKcal = grams.fatG * 9;
  const total = pKcal + cKcal + fKcal;
  if (total <= 0) return { ...EMPTY_MACROS };
  const proteinPct = Math.round((pKcal / total) * 100);
  const carbsPct = Math.round((cKcal / total) * 100);
  // La grasa absorbe el redondeo para que siempre sumen 100.
  return { proteinPct, carbsPct, fatPct: 100 - proteinPct - carbsPct };
}

/** Kcal + gramos de macros que aporta `quantity` unidades de `food`. */
export function itemTotals(quantity: number, food: Food): NutritionTotals {
  const factor = food.refQuantity > 0 ? quantity / food.refQuantity : 0;
  const grams: MacroGrams = {
    proteinG: round1(food.proteinG * factor),
    carbsG: round1(food.carbsG * factor),
    fatG: round1(food.fatG * factor),
  };
  const kcal = round(food.kcal * factor);
  return { kcal, grams, macros: gramsToMacroPct(grams) };
}

function sumGrams(a: MacroGrams, b: MacroGrams): MacroGrams {
  return {
    proteinG: round1(a.proteinG + b.proteinG),
    carbsG: round1(a.carbsG + b.carbsG),
    fatG: round1(a.fatG + b.fatG),
  };
}

/** Totales de una lista de items del editor, contra el catálogo indexado por id. */
export function mealInputTotals(
  items: readonly MealItemInput[],
  foodsById: Map<string, Food>,
): NutritionTotals {
  let kcal = 0;
  let grams: MacroGrams = { ...EMPTY_GRAMS };
  for (const item of items) {
    const food = foodsById.get(item.foodId);
    if (!food) continue;
    const t = itemTotals(item.quantity, food);
    kcal += t.kcal;
    grams = sumGrams(grams, t.grams);
  }
  return { kcal: round(kcal), grams, macros: gramsToMacroPct(grams) };
}

/** Totales de un plan a partir de las comidas del editor. */
export function planInputTotals(
  meals: readonly { items: readonly MealItemInput[] }[],
  foodsById: Map<string, Food>,
): NutritionTotals {
  return mealInputTotals(
    meals.flatMap((m) => m.items),
    foodsById,
  );
}

// --- Ensamblado del plan (compartido por el mock y el Gateway Supabase) ----

/** Comida cruda tal como sale de storage / la BD, antes de resolver kcal. */
export interface RawMeal {
  id: string;
  name: string;
  items: { id: string; foodId: string; foodName: string; quantity: number }[];
}

/** Metadatos del plan sin las comidas ni los totales. */
export interface PlanMeta {
  id: string;
  name: string;
  category: NutritionCategory;
  targetKcalPerDay: number | null;
  imageUrl: string;
  notes?: string;
  assignedCount: number;
}

function resolveMeal(raw: RawMeal, foodsById: Map<string, Food>): Meal {
  const items: MealItem[] = raw.items.map((item) => {
    const food = foodsById.get(item.foodId);
    return {
      id: item.id,
      foodId: item.foodId,
      foodName: item.foodName || food?.name || 'Alimento',
      quantity: item.quantity,
      unit: food?.unit ?? 'g',
      kcal: food ? itemTotals(item.quantity, food).kcal : 0,
    };
  });
  return { id: raw.id, name: raw.name, items, kcal: items.reduce((n, i) => n + i.kcal, 0) };
}

/** Ensambla el detalle completo del plan (comidas resueltas + totales calculados). */
export function buildPlanDetail(
  meta: PlanMeta,
  rawMeals: readonly RawMeal[],
  foodsById: Map<string, Food>,
): NutritionPlanDetail {
  const meals = rawMeals.map((raw) => resolveMeal(raw, foodsById));
  const allItems: MealItemInput[] = rawMeals.flatMap((m) =>
    m.items.map((i) => ({ foodId: i.foodId, quantity: i.quantity })),
  );
  const totals = mealInputTotals(allItems, foodsById);
  const hasFood = allItems.length > 0;
  return {
    ...meta,
    kcalPerDay: hasFood ? totals.kcal : (meta.targetKcalPerDay ?? 0),
    macros: totals.macros,
    mealCount: rawMeals.length,
    meals,
    totals,
  };
}

/** Proyecta un detalle a su resumen (para `list()`). */
export function toPlanSummary(detail: NutritionPlanDetail): NutritionPlan {
  const { meals: _meals, totals: _totals, ...summary } = detail;
  return summary;
}
