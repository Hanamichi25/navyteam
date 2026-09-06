/**
 * Tipos del dominio "planes de alimentación".
 *
 * Desde la Fase 12 un plan se arma por comidas (`Meal`) con alimentos del
 * catálogo (`@/types/food`), y las kcal/macros se **calculan** de ese contenido
 * (ver `src/features/nutrition/nutritionMath.ts`). El `targetKcalPerDay` es un
 * objetivo opcional para comparar.
 */

import type { FoodUnit } from './food';

export type NutritionCategory = 'weight_loss' | 'volume' | 'maintenance';

/** Distribución de macronutrientes en porcentaje (suman 100; siempre derivada). */
export interface Macros {
  /** Proteína (%). */
  proteinPct: number;
  /** Carbohidratos (%). */
  carbsPct: number;
  /** Grasas (%). */
  fatPct: number;
}

/** Macros en gramos. */
export interface MacroGrams {
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/** Totales calculados de una comida o de un plan completo. */
export interface NutritionTotals {
  kcal: number;
  grams: MacroGrams;
  /** Reparto porcentual derivado de `grams` (0/0/0 si `kcal` es 0). */
  macros: Macros;
}

// --- Modelo de escritura (lo que envía el editor) --------------------------

/** Un alimento dentro de una comida, tal como lo edita el entrenador. */
export interface MealItemInput {
  foodId: string;
  /** Cantidad en la unidad del alimento (g / ml / nº de unidades). */
  quantity: number;
}

/** Una comida del plan tal como la edita el entrenador. */
export interface MealInput {
  name: string;
  items: MealItemInput[];
}

// --- Modelo de lectura (ya resuelto por el Gateway) -----------------------

/** Un alimento dentro de una comida, con su nombre y kcal ya resueltos. */
export interface MealItem {
  id: string;
  foodId: string;
  /** Nombre denormalizado del alimento al momento de guardar. */
  foodName: string;
  quantity: number;
  unit: FoodUnit;
  /** Kcal que aporta esta cantidad. */
  kcal: number;
}

/** Una comida del plan (desayuno, almuerzo, ...), con su total de kcal. */
export interface Meal {
  id: string;
  name: string;
  items: MealItem[];
  kcal: number;
}

// --- Plan -----------------------------------------------------------------

/** Plan de alimentación del catálogo del entrenador (resumen, para la lista). */
export interface NutritionPlan {
  id: string;
  name: string;
  category: NutritionCategory;
  /** Objetivo diario que fijó el entrenador, o `null` si no puso ninguno. */
  targetKcalPerDay: number | null;
  /** Kcal del plan: total calculado de las comidas; si no hay comidas, el objetivo; 0 si nada. */
  kcalPerDay: number;
  /** Reparto de macros derivado de las comidas (0/0/0 si no hay). */
  macros: Macros;
  /** Nº de comidas del plan. */
  mealCount: number;
  /** Cuántos clientes tienen este plan asignado. */
  assignedCount: number;
  /** Imagen de portada (URL remota en esta fase). */
  imageUrl: string;
  /** Notas de texto libre del entrenador (indicaciones, sustituciones, etc.). */
  notes?: string;
}

/** Detalle completo de un plan (editor + vista de cliente): incluye las comidas. */
export interface NutritionPlanDetail extends NutritionPlan {
  meals: Meal[];
  totals: NutritionTotals;
}

/** Campos editables al crear/actualizar un plan de alimentación. */
export interface NutritionPlanInput {
  name: string;
  category: NutritionCategory;
  targetKcalPerDay: number | null;
  notes?: string;
  meals: MealInput[];
}
