import type { Ionicons } from '@expo/vector-icons';

import type { ChipOption } from '@/components/ChipGroup';
import { COLORS } from '@/lib/colors';
import type { AchievementKind, ActivityKind } from '@/types/dashboard';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

/** Icono de cada métrica del "Resumen", por `DashboardStat.id`. */
export const STAT_ICONS: Record<string, IoniconName> = {
  sessions: 'barbell-outline',
  clients_trained: 'people-outline',
  measurements: 'body-outline',
};

/** Icono y tono de cada tipo de actividad del feed. */
export const ACTIVITY_KIND_META: Record<
  ActivityKind,
  { icon: IoniconName; bg: string; fg: string }
> = {
  workout: { icon: 'checkmark-done-outline', bg: 'bg-primary-light', fg: COLORS.primary },
  weight: { icon: 'trending-down-outline', bg: 'bg-emerald-100', fg: '#047857' },
  message: { icon: 'chatbubble-ellipses-outline', bg: 'bg-amber-100', fg: '#B45309' },
};

/**
 * Icono y tono de cada tipo de logro del bloque "Logros de la semana". PRs de
 * carga/volumen usan `gold` (dorado ancla, acento de insignia reservado a
 * logros); el 1RM estimado, al ser la métrica "insignia", usa el `primary` de
 * marca.
 */
export const ACHIEVEMENT_KIND_META: Record<
  AchievementKind,
  { icon: IoniconName; bg: string; fg: string }
> = {
  weight_pr: { icon: 'barbell', bg: 'bg-gold-light', fg: COLORS.gold },
  e1rm_pr: { icon: 'trending-up', bg: 'bg-primary-light', fg: COLORS.primary },
  volume_pr: { icon: 'stats-chart', bg: 'bg-gold-light', fg: COLORS.gold },
  streak: { icon: 'flame', bg: 'bg-rose-100', fg: '#BE123C' },
};

/** Filtro del feed de actividad (una sola selección). */
export type ActivityFilter = 'all' | ActivityKind;

export const ACTIVITY_FILTERS: readonly ChipOption<ActivityFilter>[] = [
  { value: 'all', label: 'Todo' },
  { value: 'workout', label: 'Entrenos' },
  { value: 'weight', label: 'Peso' },
  { value: 'message', label: 'Mensajes' },
];
