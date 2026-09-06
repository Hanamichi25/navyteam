import { createId } from '@/lib/id';
import { supabase } from '@/lib/supabase';
import { unwrapList, unwrapRequired } from '@/lib/supabaseQuery';
import type { Food, FoodUnit } from '@/types/food';
import type {
  NutritionCategory,
  NutritionPlan,
  NutritionPlanDetail,
  NutritionPlanInput,
} from '@/types/nutrition';
import type { NutritionGateway } from '../gateway';
import { buildPlanDetail, toPlanSummary, type PlanMeta, type RawMeal } from '../nutritionMath';

/**
 * Implementación real de `NutritionGateway` sobre Supabase
 * (`nutrition_plans` + `nutrition_meals` + `nutrition_meal_items`).
 *
 * Las kcal/macros se calculan en cliente con `nutritionMath.ts` a partir de
 * los alimentos embebidos en cada item. `create`/`update` reemplazan las
 * comidas en bloque (misma semántica que `RoutinesGateway` con `blocks`).
 */

interface FoodEmbed {
  id: string;
  unit: string;
  ref_quantity: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface ItemRow {
  id: string;
  food_id: string;
  food_name: string;
  quantity: number;
  position: number;
  foods: FoodEmbed | null;
}

interface MealRow {
  id: string;
  name: string;
  position: number;
  nutrition_meal_items: ItemRow[];
}

interface PlanRow {
  id: string;
  name: string;
  category: string;
  target_kcal_per_day: number | null;
  image_url: string;
  notes: string | null;
  clients?: { count: number }[];
  nutrition_meals?: MealRow[];
}

const COLUMNS = `
  id, name, category, target_kcal_per_day, image_url, notes, clients(count),
  nutrition_meals(
    id, name, position,
    nutrition_meal_items(
      id, food_id, food_name, quantity, position,
      foods(id, unit, ref_quantity, kcal, protein_g, carbs_g, fat_g)
    )
  )
`;

function placeholderImageUrl(): string {
  const seeds = ['salad', 'mealprep', 'bowl', 'recomp', 'greens', 'grains'];
  const seed = seeds[Math.floor(Math.random() * seeds.length)];
  return `https://picsum.photos/seed/navyteam-${seed}-${createId('img')}/640/360`;
}

function foodEmbedToFood(e: FoodEmbed): Food {
  return {
    id: e.id,
    name: '',
    unit: e.unit as FoodUnit,
    refQuantity: e.ref_quantity,
    kcal: e.kcal,
    proteinG: e.protein_g,
    carbsG: e.carbs_g,
    fatG: e.fat_g,
  };
}

function rowToDetail(row: PlanRow): NutritionPlanDetail {
  const meals = (row.nutrition_meals ?? []).slice().sort((a, b) => a.position - b.position);
  const foodsById = new Map<string, Food>();
  const rawMeals: RawMeal[] = meals.map((meal) => ({
    id: meal.id,
    name: meal.name,
    items: (meal.nutrition_meal_items ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((item) => {
        if (item.foods) foodsById.set(item.food_id, foodEmbedToFood(item.foods));
        return {
          id: item.id,
          foodId: item.food_id,
          foodName: item.food_name,
          quantity: item.quantity,
        };
      }),
  }));

  const meta: PlanMeta = {
    id: row.id,
    name: row.name,
    category: row.category as NutritionCategory,
    targetKcalPerDay: row.target_kcal_per_day,
    imageUrl: row.image_url,
    assignedCount: row.clients?.[0]?.count ?? 0,
    ...(row.notes ? { notes: row.notes } : {}),
  };
  return buildPlanDetail(meta, rawMeals, foodsById);
}

/** Filas de `nutrition_meals` + `nutrition_meal_items` a insertar para un plan. */
async function replaceMeals(planId: string, input: NutritionPlanInput): Promise<void> {
  const del = await supabase.from('nutrition_meals').delete().eq('plan_id', planId);
  if (del.error) throw new Error(del.error.message);
  if (input.meals.length === 0) return;

  // Nombres de alimentos para denormalizar.
  const foodIds = [...new Set(input.meals.flatMap((m) => m.items.map((i) => i.foodId)))];
  const foodNames = new Map<string, string>();
  if (foodIds.length > 0) {
    const { data, error } = await supabase.from('foods').select('id, name').in('id', foodIds);
    if (error) throw new Error(error.message);
    for (const f of (data ?? []) as { id: string; name: string }[]) foodNames.set(f.id, f.name);
  }

  const mealRows = input.meals.map((meal, position) => ({
    id: createId('meal'),
    plan_id: planId,
    name: meal.name,
    position,
  }));
  const insMeals = await supabase.from('nutrition_meals').insert(mealRows);
  if (insMeals.error) throw new Error(insMeals.error.message);

  const itemRows = input.meals.flatMap((meal, mi) =>
    meal.items.map((item, position) => ({
      id: createId('mi'),
      meal_id: mealRows[mi]!.id,
      food_id: item.foodId,
      food_name: foodNames.get(item.foodId) ?? 'Alimento',
      quantity: item.quantity,
      position,
    })),
  );
  if (itemRows.length > 0) {
    const insItems = await supabase.from('nutrition_meal_items').insert(itemRows);
    if (insItems.error) throw new Error(insItems.error.message);
  }
}

async function fetchDetail(id: string): Promise<NutritionPlanDetail> {
  const row = unwrapRequired(
    await supabase.from('nutrition_plans').select(COLUMNS).eq('id', id).single(),
    `Plan no encontrado: ${id}`,
  );
  return rowToDetail(row as unknown as PlanRow);
}

export function createSupabaseNutritionGateway(): NutritionGateway {
  return {
    async list(): Promise<NutritionPlan[]> {
      const rows = unwrapList(await supabase.from('nutrition_plans').select(COLUMNS).order('name'));
      return rows.map((row) => toPlanSummary(rowToDetail(row as unknown as PlanRow)));
    },

    async get(id) {
      return fetchDetail(id);
    },

    async create(input: NutritionPlanInput) {
      const id = createId('nut');
      const created = await supabase.from('nutrition_plans').insert({
        id,
        name: input.name,
        category: input.category,
        target_kcal_per_day: input.targetKcalPerDay,
        image_url: placeholderImageUrl(),
        notes: input.notes || null,
      });
      if (created.error) throw new Error(created.error.message);
      await replaceMeals(id, input);
      return fetchDetail(id);
    },

    async update(id, input) {
      const patch: Record<string, unknown> = {};
      if (input.name !== undefined) patch.name = input.name;
      if (input.category !== undefined) patch.category = input.category;
      if (input.targetKcalPerDay !== undefined) patch.target_kcal_per_day = input.targetKcalPerDay;
      if (input.notes !== undefined) patch.notes = input.notes || null;
      if (Object.keys(patch).length > 0) {
        const updated = await supabase.from('nutrition_plans').update(patch).eq('id', id);
        if (updated.error) throw new Error(updated.error.message);
      }
      if (input.meals !== undefined) {
        await replaceMeals(id, { ...(input as NutritionPlanInput), meals: input.meals });
      }
      return fetchDetail(id);
    },

    async remove(id) {
      const { error } = await supabase.from('nutrition_plans').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
}
