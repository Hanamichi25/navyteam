import type { Ionicons } from '@expo/vector-icons';

import type { ChipOption } from '@/components/ChipGroup';
import type { ActivityKind } from '@/types/dashboard';

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
  workout: { icon: 'checkmark-done-outline', bg: 'bg-emerald-100', fg: '#047857' },
  weight: { icon: 'trending-down-outline', bg: 'bg-primary-light', fg: '#2563EB' },
  message: { icon: 'chatbubble-ellipses-outline', bg: 'bg-amber-100', fg: '#B45309' },
};

/** Filtro del feed de actividad (una sola selección). */
export type ActivityFilter = 'all' | ActivityKind;

export const ACTIVITY_FILTERS: readonly ChipOption<ActivityFilter>[] = [
  { value: 'all', label: 'Todo' },
  { value: 'workout', label: 'Entrenos' },
  { value: 'weight', label: 'Peso' },
  { value: 'message', label: 'Mensajes' },
];
