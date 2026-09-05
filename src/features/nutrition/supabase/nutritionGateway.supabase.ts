import { createId } from '@/lib/id';
import { supabase } from '@/lib/supabase';
import { unwrapList, unwrapRequired } from '@/lib/supabaseQuery';
import type { NutritionCategory, NutritionPlan, NutritionPlanInput } from '@/types/nutrition';
import type { NutritionGateway } from '../gateway';

/**
 * Implementación real de `NutritionGateway` sobre Supabase (`nutrition_plans`).
 * `assignedCount` se deriva del número de clientes con ese plan (embed
 * `clients(count)` de PostgREST) — resuelve la desincronización del mock.
 * Los macros se guardan como 3 columnas `*_pct` y se recomponen en `macros`.
 */

interface PlanRow {
  id: string;
  name: string;
  category: string;
  kcal_per_day: number;
  protein_pct: number;
  carbs_pct: number;
  fat_pct: number;
  image_url: string;
  notes: string | null;
  clients?: { count: number }[];
}

const COLUMNS =
  'id, name, category, kcal_per_day, protein_pct, carbs_pct, fat_pct, image_url, notes, clients(count)';

/** Imagen de portada por defecto (mismo criterio que el mock). */
function placeholderImageUrl(): string {
  const seeds = ['salad', 'mealprep', 'bowl', 'recomp', 'greens', 'grains'];
  const seed = seeds[Math.floor(Math.random() * seeds.length)];
  return `https://picsum.photos/seed/navyteam-${seed}-${createId('img')}/640/360`;
}

function rowToPlan(row: PlanRow): NutritionPlan {
  return {
    id: row.id,
    name: row.name,
    category: row.category as NutritionCategory,
    kcalPerDay: row.kcal_per_day,
    macros: {
      proteinPct: row.protein_pct,
      carbsPct: row.carbs_pct,
      fatPct: row.fat_pct,
    },
    assignedCount: row.clients?.[0]?.count ?? 0,
    imageUrl: row.image_url,
    ...(row.notes ? { notes: row.notes } : {}),
  };
}

function inputToRow(input: Partial<NutritionPlanInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.category !== undefined) row.category = input.category;
  if (input.kcalPerDay !== undefined) row.kcal_per_day = input.kcalPerDay;
  if (input.macros !== undefined) {
    row.protein_pct = input.macros.proteinPct;
    row.carbs_pct = input.macros.carbsPct;
    row.fat_pct = input.macros.fatPct;
  }
  if (input.notes !== undefined) row.notes = input.notes || null;
  return row;
}

export function createSupabaseNutritionGateway(): NutritionGateway {
  return {
    async list() {
      const rows = unwrapList(
        await supabase.from('nutrition_plans').select(COLUMNS).order('name'),
      );
      return rows.map(rowToPlan);
    },

    async create(input: NutritionPlanInput) {
      const row = unwrapRequired(
        await supabase
          .from('nutrition_plans')
          .insert({ id: createId('nut'), image_url: placeholderImageUrl(), ...inputToRow(input) })
          .select(COLUMNS)
          .single(),
        'No se pudo crear el plan',
      );
      return rowToPlan(row);
    },

    async update(id, input) {
      const row = unwrapRequired(
        await supabase
          .from('nutrition_plans')
          .update(inputToRow(input))
          .eq('id', id)
          .select(COLUMNS)
          .single(),
        `Plan no encontrado: ${id}`,
      );
      return rowToPlan(row);
    },

    async remove(id) {
      const { error } = await supabase.from('nutrition_plans').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
}
