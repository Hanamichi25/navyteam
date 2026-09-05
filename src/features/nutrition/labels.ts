import type { Ionicons } from '@expo/vector-icons';

import type { BadgeTone } from '@/components/Badge';
import type { ChipOption } from '@/components/ChipGroup';
import type { NutritionCategory } from '@/types/nutrition';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

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

/** Ícono de respaldo cuando la portada remota del plan no carga. */
export const NUTRITION_CATEGORY_ICON: Record<NutritionCategory, IoniconName> = {
  weight_loss: 'trending-down-outline',
  volume: 'trending-up-outline',
  maintenance: 'restaurant-outline',
};

/** Valor del filtro de categoría (incluye "todos"). */
export type NutritionCategoryFilter = NutritionCategory | 'all';

export const NUTRITION_CATEGORY_FILTERS: readonly ChipOption<NutritionCategoryFilter>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'weight_loss', label: 'Pérdida de peso' },
  { value: 'volume', label: 'Volumen' },
  { value: 'maintenance', label: 'Mantenimiento' },
];

/** Opciones de categoría para formularios (sin el filtro "Todos"). */
export const NUTRITION_CATEGORY_OPTIONS: readonly ChipOption<NutritionCategory>[] = [
  { value: 'weight_loss', label: 'Pérdida de peso' },
  { value: 'volume', label: 'Volumen' },
  { value: 'maintenance', label: 'Mantenimiento' },
];
