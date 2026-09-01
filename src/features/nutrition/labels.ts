import type { BadgeTone } from '@/components/Badge';
import type { ChipOption } from '@/components/ChipGroup';
import type { NutritionCategory } from '@/types/nutrition';

export const NUTRITION_CATEGORY_LABEL: Record<NutritionCategory, string> = {
  weight_loss: 'Pérdida de peso',
  volume: 'Volumen',
  maintenance: 'Mantenimiento',
};

export const NUTRITION_CATEGORY_TONE: Record<NutritionCategory, BadgeTone> = {
  weight_loss: 'danger',
  volume: 'success',
  maintenance: 'warning',
};

/** Valor del filtro de categoría (incluye "todos"). */
export type NutritionCategoryFilter = NutritionCategory | 'all';

export const NUTRITION_CATEGORY_FILTERS: readonly ChipOption<NutritionCategoryFilter>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'weight_loss', label: 'Pérdida de peso' },
  { value: 'volume', label: 'Volumen' },
  { value: 'maintenance', label: 'Mantenimiento' },
];
