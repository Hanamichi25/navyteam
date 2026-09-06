import { Ionicons } from '@expo/vector-icons';

import type { ChipOption } from '@/components/ChipGroup';
import type { MuscleGroup } from '@/types/exercise';

export const MUSCLE_GROUP_LABEL: Record<MuscleGroup, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  legs: 'Piernas',
  shoulders: 'Hombros',
  arms: 'Brazos',
  core: 'Core',
  cardio: 'Cardio',
  full_body: 'Cuerpo completo',
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

/** Icono representativo de cada grupo muscular (catálogo + editor de rutinas). */
export const MUSCLE_GROUP_ICON: Record<MuscleGroup, IoniconName> = {
  chest: 'body-outline',
  back: 'body-outline',
  legs: 'walk-outline',
  shoulders: 'body-outline',
  arms: 'barbell-outline',
  core: 'ellipse-outline',
  cardio: 'heart-outline',
  full_body: 'fitness-outline',
};

/** Valor del filtro de grupo muscular (incluye "todos"). */
export type MuscleGroupFilter = MuscleGroup | 'all';

export const MUSCLE_GROUP_FILTERS: readonly ChipOption<MuscleGroupFilter>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'chest', label: 'Pecho' },
  { value: 'back', label: 'Espalda' },
  { value: 'legs', label: 'Piernas' },
  { value: 'shoulders', label: 'Hombros' },
  { value: 'arms', label: 'Brazos' },
  { value: 'core', label: 'Core' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'full_body', label: 'Cuerpo completo' },
];

/** Opciones de grupo muscular para formularios (sin el filtro "Todos"). */
export const MUSCLE_GROUP_OPTIONS: readonly ChipOption<MuscleGroup>[] = MUSCLE_GROUP_FILTERS.filter(
  (option): option is ChipOption<MuscleGroup> => option.value !== 'all',
);
