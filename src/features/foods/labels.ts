import type { ChipOption } from '@/components/ChipGroup';
import type { FoodUnit } from '@/types/food';

/** Etiqueta de cada unidad de alimento. */
export const FOOD_UNIT_LABEL: Record<FoodUnit, string> = {
  g: 'Gramos',
  ml: 'Mililitros',
  unidad: 'Unidades',
};

/** Sufijo corto para mostrar cantidades ("60 g", "2 u", "200 ml"). */
export const FOOD_UNIT_SUFFIX: Record<FoodUnit, string> = {
  g: 'g',
  ml: 'ml',
  unidad: 'u',
};

/** Porción de referencia por defecto de los macros según la unidad. */
export const FOOD_REF_QUANTITY: Record<FoodUnit, number> = {
  g: 100,
  ml: 100,
  unidad: 1,
};

/** Cómo se lee la porción de referencia ("por 100 g", "por unidad"). */
export function refQuantityLabel(unit: FoodUnit, refQuantity: number): string {
  return unit === 'unidad' ? 'por unidad' : `por ${refQuantity} ${FOOD_UNIT_SUFFIX[unit]}`;
}

export const FOOD_UNIT_OPTIONS: readonly ChipOption<FoodUnit>[] = [
  { value: 'g', label: 'Gramos' },
  { value: 'ml', label: 'Mililitros' },
  { value: 'unidad', label: 'Unidades' },
];
