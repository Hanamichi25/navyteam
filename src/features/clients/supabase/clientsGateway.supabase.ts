import {
  addMonths,
  ddmmaaaaToIso,
  formatDdMmAaaa,
  formatMemberSince,
  isoToDdmmaaaa,
  parseDdMmAaaa,
  relativeDayLabel,
} from '@/lib/date';
import { createId } from '@/lib/id';
import { supabase } from '@/lib/supabase';
import { unwrapList, unwrapRequired } from '@/lib/supabaseQuery';
import type {
  AssignedRoutine,
  BodyMeasurement,
  Client,
  ClientDetail,
  ClientGoal,
  ClientInput,
  Payment,
} from '@/types/client';
import type { NutritionPlan } from '@/types/nutrition';
import type { Routine } from '@/types/routine';
import type { ClientsGateway, PaymentInput } from '../gateway';

/**
 * Implementación real de `ClientsGateway` sobre Supabase.
 *
 * Tablas: `clients` (+ columnas `subscription_until`, `nutrition_plan_id`),
 * `body_measurements`, `client_routines`, `payments`. Muchos campos de
 * `ClientDetail` son **derivados en lectura** (peso vigente, IMC, progreso,
 * última actividad) — no se almacenan, así que `addMeasurement` no tiene que
 * recalcular nada, a diferencia del mock.
 */

interface MeasurementRow {
  id: string;
  date: string;
  weight_kg: number;
  waist_cm: number | null;
  chest_cm: number | null;
  hip_cm: number | null;
  arm_cm: number | null;
}

interface PaymentRow {
  id: string;
  date: string;
  amount_eur: number;
  months: number;
  covers_until: string;
}

interface AssignedRoutineRow {
  id: string;
  schedule: string;
  routines: {
    id: string;
    name: string;
    duration_min: number;
    routine_blocks: { count: number }[];
  } | null;
}

interface ClientRow {
  id: string;
  name: string;
  avatar_url: string;
  goal: string;
  birth_date: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  height_cm: number;
  goal_kg: number;
  monthly_fee_eur: number;
  member_since: string;
  subscription_until: string | null;
  nutrition_plan_id: string | null;
  body_measurements: MeasurementRow[];
  payments: PaymentRow[];
  client_routines: AssignedRoutineRow[];
  nutrition_plans: { id: string; name: string; kcal_per_day: number } | null;
  workout_sessions: { date: string }[];
  messages: { sent_at: string }[];
}

const DETAIL_COLUMNS = `
  id, name, avatar_url, goal, birth_date, email, phone, notes, height_cm, goal_kg,
  monthly_fee_eur, member_since, subscription_until, nutrition_plan_id,
  body_measurements(id, date, weight_kg, waist_cm, chest_cm, hip_cm, arm_cm),
  payments(id, date, amount_eur, months, covers_until),
  client_routines(id, schedule, routines(id, name, duration_min, routine_blocks(count))),
  nutrition_plans(id, name, kcal_per_day),
  workout_sessions(date),
  messages(sent_at)
`;

/** Avatar de placeholder para clientes nuevos (mismo criterio que el mock). */
function placeholderAvatarUrl(): string {
  return `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`;
}

/** IMC = peso (kg) / altura (m)², a 1 decimal. 0 si falta altura o peso. */
function computeBmi(weightKg: number, heightCm: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

function measurementRowToDomain(row: MeasurementRow): BodyMeasurement {
  return {
    id: row.id,
    date: isoToDdmmaaaa(row.date),
    weightKg: row.weight_kg,
    ...(row.waist_cm != null ? { waistCm: row.waist_cm } : {}),
    ...(row.chest_cm != null ? { chestCm: row.chest_cm } : {}),
    ...(row.hip_cm != null ? { hipCm: row.hip_cm } : {}),
    ...(row.arm_cm != null ? { armCm: row.arm_cm } : {}),
  };
}

function paymentRowToDomain(row: PaymentRow): Payment {
  return {
    id: row.id,
    date: isoToDdmmaaaa(row.date),
    amountEur: row.amount_eur,
    months: row.months,
    coversUntil: isoToDdmmaaaa(row.covers_until),
  };
}

function assignedRoutineRowToDomain(row: AssignedRoutineRow): AssignedRoutine | null {
  if (!row.routines) return null;
  return {
    id: row.routines.id,
    name: row.routines.name,
    schedule: row.schedule,
    exerciseCount: row.routines.routine_blocks?.[0]?.count ?? 0,
    durationMin: row.routines.duration_min,
  };
}

/** Fecha más reciente entre sesiones, mediciones y mensajes (para "última actividad"). */
function lastActivityDate(row: ClientRow): Date | null {
  const times: number[] = [];
  for (const s of row.workout_sessions ?? []) {
    const d = parseDdMmAaaa(isoToDdmmaaaa(s.date));
    if (d) times.push(d.getTime());
  }
  for (const m of row.body_measurements ?? []) {
    const d = parseDdMmAaaa(isoToDdmmaaaa(m.date));
    if (d) times.push(d.getTime());
  }
  for (const msg of row.messages ?? []) {
    const t = Date.parse(msg.sent_at);
    if (!Number.isNaN(t)) times.push(t);
  }
  return times.length ? new Date(Math.max(...times)) : null;
}

function rowToClientDetail(row: ClientRow): ClientDetail {
  const measurements = (row.body_measurements ?? [])
    .map(measurementRowToDomain)
    .sort((a, b) => {
      const ta = parseDdMmAaaa(a.date)?.getTime() ?? 0;
      const tb = parseDdMmAaaa(b.date)?.getTime() ?? 0;
      return ta - tb;
    });
  const startKg = measurements[0]?.weightKg ?? 0;
  const currentKg = measurements[measurements.length - 1]?.weightKg ?? 0;
  const memberSinceDate = row.member_since ? new Date(row.member_since) : new Date();

  const assignedRoutines = (row.client_routines ?? [])
    .map(assignedRoutineRowToDomain)
    .filter((r): r is AssignedRoutine => r !== null);

  return {
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url,
    goal: row.goal as ClientGoal,
    lastActivity: relativeDayLabel(lastActivityDate(row)),
    subscriptionUntil: row.subscription_until ? isoToDdmmaaaa(row.subscription_until) : null,
    memberSince: formatMemberSince(memberSinceDate),
    ...(row.email ? { email: row.email } : {}),
    ...(row.phone ? { phone: row.phone } : {}),
    birthDate: row.birth_date ? isoToDdmmaaaa(row.birth_date) : '',
    ...(row.notes ? { notes: row.notes } : {}),
    weightKg: currentKg,
    heightCm: row.height_cm,
    bmi: computeBmi(currentKg, row.height_cm),
    weightProgress: { startKg, currentKg, goalKg: row.goal_kg },
    measurements,
    assignedRoutines,
    assignedPlan: row.nutrition_plans
      ? {
          id: row.nutrition_plans.id,
          name: row.nutrition_plans.name,
          kcalPerDay: row.nutrition_plans.kcal_per_day,
        }
      : null,
    monthlyFeeEur: row.monthly_fee_eur,
    payments: (row.payments ?? [])
      .map(paymentRowToDomain)
      .sort((a, b) => {
        const ta = parseDdMmAaaa(a.date)?.getTime() ?? 0;
        const tb = parseDdMmAaaa(b.date)?.getTime() ?? 0;
        return ta - tb;
      }),
  };
}

function detailToListItem(detail: ClientDetail): Client {
  const { id, name, avatarUrl, goal, lastActivity, subscriptionUntil } = detail;
  return { id, name, avatarUrl, goal, lastActivity, subscriptionUntil };
}

function inputToRow(input: Partial<ClientInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.goal !== undefined) row.goal = input.goal;
  if (input.email !== undefined) row.email = input.email || null;
  if (input.phone !== undefined) row.phone = input.phone || null;
  if (input.notes !== undefined) row.notes = input.notes || null;
  if (input.birthDate !== undefined) row.birth_date = ddmmaaaaToIso(input.birthDate);
  if (input.heightCm !== undefined) row.height_cm = input.heightCm;
  if (input.goalKg !== undefined) row.goal_kg = input.goalKg;
  if (input.monthlyFeeEur !== undefined) row.monthly_fee_eur = input.monthlyFeeEur;
  return row;
}

async function fetchDetail(id: string): Promise<ClientDetail> {
  const row = unwrapRequired(
    await supabase.from('clients').select(DETAIL_COLUMNS).eq('id', id).single(),
    `Cliente no encontrado: ${id}`,
  );
  return rowToClientDetail(row as unknown as ClientRow);
}

export function createSupabaseClientsGateway(): ClientsGateway {
  return {
    async list() {
      const rows = unwrapList(
        await supabase.from('clients').select(DETAIL_COLUMNS).order('name'),
      );
      return rows.map((row) => detailToListItem(rowToClientDetail(row as unknown as ClientRow)));
    },

    async get(id) {
      return fetchDetail(id);
    },

    async create(input: ClientInput) {
      const id = createId('cli');
      const { error } = await supabase.from('clients').insert({
        id,
        avatar_url: placeholderAvatarUrl(),
        ...inputToRow(input),
      });
      if (error) throw new Error(error.message);
      return fetchDetail(id);
    },

    async update(id, input) {
      const patch = inputToRow(input);
      if (Object.keys(patch).length > 0) {
        const { error } = await supabase.from('clients').update(patch).eq('id', id);
        if (error) throw new Error(error.message);
      }
      return fetchDetail(id);
    },

    async remove(id) {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },

    async assignRoutine(clientId: string, routine: Routine, schedule: string) {
      const { error } = await supabase
        .from('client_routines')
        .upsert(
          { id: createId('cr'), client_id: clientId, routine_id: routine.id, schedule },
          { onConflict: 'client_id,routine_id', ignoreDuplicates: true },
        );
      if (error) throw new Error(error.message);
      return fetchDetail(clientId);
    },

    async unassignRoutine(clientId: string, routineId: string) {
      const { error } = await supabase
        .from('client_routines')
        .delete()
        .eq('client_id', clientId)
        .eq('routine_id', routineId);
      if (error) throw new Error(error.message);
      return fetchDetail(clientId);
    },

    async assignPlan(clientId: string, plan: NutritionPlan) {
      const { error } = await supabase
        .from('clients')
        .update({ nutrition_plan_id: plan.id })
        .eq('id', clientId);
      if (error) throw new Error(error.message);
      return fetchDetail(clientId);
    },

    async unassignPlan(clientId: string) {
      const { error } = await supabase
        .from('clients')
        .update({ nutrition_plan_id: null })
        .eq('id', clientId);
      if (error) throw new Error(error.message);
      return fetchDetail(clientId);
    },

    async addMeasurement(clientId: string, input: Omit<BodyMeasurement, 'id'>) {
      const { error } = await supabase.from('body_measurements').insert({
        id: createId('msr'),
        client_id: clientId,
        date: ddmmaaaaToIso(input.date),
        weight_kg: input.weightKg,
        waist_cm: input.waistCm ?? null,
        chest_cm: input.chestCm ?? null,
        hip_cm: input.hipCm ?? null,
        arm_cm: input.armCm ?? null,
      });
      if (error) throw new Error(error.message);
      return fetchDetail(clientId);
    },

    async registerPayment(clientId: string, input: PaymentInput) {
      const current = unwrapRequired(
        await supabase
          .from('clients')
          .select('subscription_until')
          .eq('id', clientId)
          .single(),
        `Cliente no encontrado: ${clientId}`,
      ) as { subscription_until: string | null };

      const now = new Date();
      const currentUntil = current.subscription_until
        ? new Date(current.subscription_until)
        : null;
      const base = currentUntil && currentUntil.getTime() > now.getTime() ? currentUntil : now;
      const coversUntilDate = addMonths(base, input.months);
      const coversUntilIso = ddmmaaaaToIso(formatDdMmAaaa(coversUntilDate));

      const payment = await supabase.from('payments').insert({
        id: createId('pay'),
        client_id: clientId,
        date: ddmmaaaaToIso(input.date),
        amount_eur: input.amountEur,
        months: input.months,
        covers_until: coversUntilIso,
      });
      if (payment.error) throw new Error(payment.error.message);

      const bump = await supabase
        .from('clients')
        .update({ subscription_until: coversUntilIso })
        .eq('id', clientId);
      if (bump.error) throw new Error(bump.error.message);

      return fetchDetail(clientId);
    },
  };
}
