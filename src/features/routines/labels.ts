import type { ChipOption } from '@/components/ChipGroup';
import type { RoutineCategory, RoutineLevel } from '@/types/routine';

export const ROUTINE_CATEGORY_LABEL: Record<RoutineCategory, string> = {
  strength: 'Fuerza',
  cardio: 'Cardio',
  flexibility: 'Flexibilidad',
};

export const ROUTINE_LEVEL_LABEL: Record<RoutineLevel, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

/** Valor del filtro de categoría (incluye "todas"). */
export type RoutineCategoryFilter = RoutineCategory | 'all';

export const ROUTINE_CATEGORY_FILTERS: readonly ChipOption<RoutineCategoryFilter>[] = [
  { value: 'all', label: 'Todas' },
  { value: 'strength', label: 'Fuerza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibilidad' },
];

/** Opciones de categoría para formularios (sin el filtro "Todas"). */
export const ROUTINE_CATEGORY_OPTIONS: readonly ChipOption<RoutineCategory>[] = [
  { value: 'strength', label: 'Fuerza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibilidad' },
];

/** Opciones de nivel para formularios. */
export const ROUTINE_LEVEL_OPTIONS: readonly ChipOption<RoutineLevel>[] = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
];
