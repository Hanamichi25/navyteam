import type { BadgeTone } from '@/components/Badge';
import type { ChipOption } from '@/components/ChipGroup';
import type { ClientGoal } from '@/types/client';

export const CLIENT_GOAL_LABEL: Record<ClientGoal, string> = {
  weight_loss: 'Pérdida de peso',
  muscle_gain: 'Ganancia muscular',
  maintenance: 'Mantenimiento',
};

export const CLIENT_GOAL_TONE: Record<ClientGoal, BadgeTone> = {
  weight_loss: 'danger',
  muscle_gain: 'success',
  maintenance: 'warning',
};

/** Opciones de objetivo para el formulario de alta/edición de cliente. */
export const CLIENT_GOAL_OPTIONS: readonly ChipOption<ClientGoal>[] = [
  { value: 'weight_loss', label: 'Pérdida de peso' },
  { value: 'muscle_gain', label: 'Ganancia muscular' },
  { value: 'maintenance', label: 'Mantenimiento' },
];
