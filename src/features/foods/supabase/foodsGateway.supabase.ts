import { createId } from '@/lib/id';
import { supabase } from '@/lib/supabase';
import { unwrapList, unwrapRequired } from '@/lib/supabaseQuery';
import type { Food, FoodInput, FoodUnit } from '@/types/food';
import type { FoodsGateway } from '../gateway';

/**
 * Implementación real de `FoodsGateway` sobre Supabase (tabla `foods`).
 * El catálogo es del coach; un cliente solo lo lee para ver su plan.
 */

interface FoodRow {
  id: string;
  name: string;
  unit: string;
  ref_quantity: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

const COLUMNS = 'id, name, unit, ref_quantity, kcal, protein_g, carbs_g, fat_g';

function rowToFood(row: FoodRow): Food {
  return {
    id: row.id,
    name: row.name,
    unit: row.unit as FoodUnit,
    refQuantity: row.ref_quantity,
    kcal: row.kcal,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    fatG: row.fat_g,
  };
}

function inputToRow(input: Partial<FoodInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.unit !== undefined) row.unit = input.unit;
  if (input.refQuantity !== undefined) row.ref_quantity = input.refQuantity;
  if (input.kcal !== undefined) row.kcal = input.kcal;
  if (input.proteinG !== undefined) row.protein_g = input.proteinG;
  if (input.carbsG !== undefined) row.carbs_g = input.carbsG;
  if (input.fatG !== undefined) row.fat_g = input.fatG;
  return row;
}

export function createSupabaseFoodsGateway(): FoodsGateway {
  return {
    async list() {
      const rows = unwrapList(await supabase.from('foods').select(COLUMNS).order('name'));
      return rows.map(rowToFood);
    },

    async create(input: FoodInput) {
      const row = unwrapRequired(
        await supabase
          .from('foods')
          .insert({ id: createId('fd'), ...inputToRow(input) })
          .select(COLUMNS)
          .single(),
        'No se pudo crear el alimento',
      );
      return rowToFood(row);
    },

    async update(id, input) {
      const row = unwrapRequired(
        await supabase
          .from('foods')
          .update(inputToRow(input))
          .eq('id', id)
          .select(COLUMNS)
          .single(),
        `Alimento no encontrado: ${id}`,
      );
      return rowToFood(row);
    },

    async remove(id) {
      const { error } = await supabase.from('foods').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
}
