import type { BadgeTone } from '@/components/Badge';
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
