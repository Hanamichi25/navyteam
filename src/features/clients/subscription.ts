/**
 * Lógica pura de la suscripción del cliente: derivar su estado a partir de la
 * fecha de vigencia. Sin React, sin I/O.
 */

import type { BadgeTone } from '@/components/Badge';
import { parseDdMmAaaa } from '@/lib/date';
import type { SubscriptionStatus } from '@/types/client';

/** Días de antelación con los que una suscripción vigente pasa a "por vencer". */
const EXPIRING_SOON_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Estado de la suscripción según `subscriptionUntil` (`dd/mm/aaaa`) vs. hoy. */
export function subscriptionStatus(
  subscriptionUntil: string | null,
  now: Date = new Date(),
): SubscriptionStatus {
  if (!subscriptionUntil) return 'none';
  const until = parseDdMmAaaa(subscriptionUntil);
  if (!until) return 'none';

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((until.getTime() - today.getTime()) / DAY_MS);

  if (diffDays < 0) return 'expired';
  if (diffDays <= EXPIRING_SOON_DAYS) return 'expiring';
  return 'active';
}

/** Etiqueta y tono de cada estado, para `Badge`. */
export const SUBSCRIPTION_STATUS_META: Record<
  SubscriptionStatus,
  { label: string; tone: BadgeTone }
> = {
  active: { label: 'Vigente', tone: 'success' },
  expiring: { label: 'Por vencer', tone: 'warning' },
  expired: { label: 'Vencida', tone: 'danger' },
  none: { label: 'Sin suscripción', tone: 'neutral' },
};
