import { isoToDdmmaaaa, parseDdMmAaaa, relativeDayLabel } from '@/lib/date';
import { supabase } from '@/lib/supabase';
import { unwrapList } from '@/lib/supabaseQuery';
import type {
  Achievement,
  ActivityItem,
  DashboardData,
  DashboardStat,
  StatTrend,
} from '@/types/dashboard';
import type { WorkoutSession } from '@/types/workout';
import { buildExerciseProgress, buildTrainingSummary, listTrainedExercises } from '@/features/workouts';
import type { DashboardGateway } from '../gateway';

/**
 * Implementación real (parcial) de `DashboardGateway` sobre Supabase.
 *
 * `activeUsers`, `stats`, `weeklyAchievements` y `recentActivity` se derivan de
 * datos reales (`clients` + `workout_sessions` + `body_measurements` +
 * `messages`); `weeklyAchievements` reutiliza las funciones puras de
 * `progress.ts` (vía el barrel de `workouts`). `upcomingSessions` = `[]`: no
 * hay modelo de agenda de sesiones todavía (hueco documentado en AGENTS.md).
 */

interface ClientLite {
  id: string;
  name: string;
  avatar_url: string;
}

interface SessionRow {
  id: string;
  client_id: string;
  routine_id: string | null;
  routine_name: string;
  date: string;
  duration_min: number | null;
  notes: string | null;
  workout_exercise_logs: {
    id: string;
    exercise_id: string | null;
    exercise_name: string;
    position: number;
    workout_set_logs: { set_number: number; reps: number; weight_kg: number; rpe: number | null }[];
  }[];
}

const SESSION_COLUMNS = `
  id, client_id, routine_id, routine_name, date, duration_min, notes,
  workout_exercise_logs(id, exercise_id, exercise_name, position,
    workout_set_logs(set_number, reps, weight_kg, rpe))
`;

const DAY_MS = 86_400_000;

function sessionRowToDomain(row: SessionRow): WorkoutSession {
  return {
    id: row.id,
    clientId: row.client_id,
    routineId: row.routine_id ?? '',
    routineName: row.routine_name,
    date: isoToDdmmaaaa(row.date),
    ...(row.duration_min != null ? { durationMin: row.duration_min } : {}),
    ...(row.notes ? { notes: row.notes } : {}),
    exercises: (row.workout_exercise_logs ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((log) => ({
        id: log.id,
        exerciseId: log.exercise_id ?? '',
        exerciseName: log.exercise_name,
        sets: (log.workout_set_logs ?? [])
          .slice()
          .sort((a, b) => a.set_number - b.set_number)
          .map((set) => ({
            setNumber: set.set_number,
            reps: set.reps,
            weightKg: set.weight_kg,
            ...(set.rpe != null ? { rpe: set.rpe } : {}),
          })),
      })),
  };
}

function trend(delta: number): StatTrend {
  if (delta > 0) return 'up';
  if (delta < 0) return 'down';
  return 'flat';
}

/** Sesiones cuya fecha cae en `[from, to)`. */
function sessionsInRange(sessions: WorkoutSession[], from: number, to: number): WorkoutSession[] {
  return sessions.filter((s) => {
    const t = parseDdMmAaaa(s.date)?.getTime();
    return t !== undefined && t >= from && t < to;
  });
}

function statsForWindow(
  sessions: WorkoutSession[],
  measurementTimes: number[],
  now: number,
  windowDays: number,
): DashboardStat[] {
  const span = windowDays * DAY_MS;
  const curr = sessionsInRange(sessions, now - span, now + DAY_MS);
  const prev = sessionsInRange(sessions, now - 2 * span, now - span);

  const measCurr = measurementTimes.filter((t) => t >= now - span).length;
  const measPrev = measurementTimes.filter((t) => t >= now - 2 * span && t < now - span).length;

  const clientsCurr = new Set(curr.map((s) => s.clientId)).size;
  const clientsPrev = new Set(prev.map((s) => s.clientId)).size;

  const rows: { id: string; label: string; value: number; delta: number }[] = [
    { id: 'sessions', label: 'Sesiones registradas', value: curr.length, delta: curr.length - prev.length },
    { id: 'clients_trained', label: 'Clientes entrenados', value: clientsCurr, delta: clientsCurr - clientsPrev },
    { id: 'measurements', label: 'Mediciones nuevas', value: measCurr, delta: measCurr - measPrev },
  ];
  return rows.map((r) => ({ ...r, trend: trend(r.delta) }));
}

function buildAchievements(
  sessions: WorkoutSession[],
  clientsById: Map<string, ClientLite>,
  now: number,
): Achievement[] {
  const weekAgo = now - 7 * DAY_MS;
  const out: Achievement[] = [];

  for (const [clientId, client] of clientsById) {
    const clientSessions = sessions.filter((s) => s.clientId === clientId);
    if (clientSessions.length === 0) continue;

    for (const trained of listTrainedExercises(clientSessions)) {
      const progress = buildExerciseProgress(trained.exerciseId, clientSessions);
      const last = progress.points[progress.points.length - 1];
      if (!last) continue;
      const lastTime = parseDdMmAaaa(last.date)?.getTime() ?? 0;
      if (lastTime < weekAgo) continue;

      if (last.topWeightKg >= progress.prWeightKg && progress.points.length > 1) {
        out.push({
          id: `ach_w_${clientId}_${trained.exerciseId}`,
          clientId,
          clientName: client.name,
          clientAvatarUrl: client.avatar_url,
          kind: 'weight_pr',
          exerciseId: trained.exerciseId,
          detail: `${progress.exerciseName} — ${last.topWeightKg} kg, nuevo récord de carga`,
        });
      } else if (last.estimated1RM >= progress.prEstimated1RM && progress.points.length > 1) {
        out.push({
          id: `ach_e_${clientId}_${trained.exerciseId}`,
          clientId,
          clientName: client.name,
          clientAvatarUrl: client.avatar_url,
          kind: 'e1rm_pr',
          exerciseId: trained.exerciseId,
          detail: `${progress.exerciseName} — ${Math.round(last.estimated1RM)} kg de 1RM estimado`,
        });
      }
    }

    const streak = buildTrainingSummary(clientSessions).currentStreakWeeks;
    if (streak >= 2) {
      out.push({
        id: `ach_s_${clientId}`,
        clientId,
        clientName: client.name,
        clientAvatarUrl: client.avatar_url,
        kind: 'streak',
        detail: `${streak} semanas seguidas entrenando`,
      });
    }
  }

  return out.slice(0, 6);
}

async function currentUid(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const uid = data.user?.id;
  if (!uid) throw new Error('No hay sesión.');
  return uid;
}

export function createSupabaseDashboardGateway(): DashboardGateway {
  return {
    async get(): Promise<DashboardData> {
      const dismissedRows = unwrapList(
        await supabase.from('dashboard_dismissals').select('item_key'),
      ) as { item_key: string }[];
      const dismissed = new Set(dismissedRows.map((r) => r.item_key));

      const clients = unwrapList(
        await supabase.from('clients').select('id, name, avatar_url').order('name'),
      ) as ClientLite[];
      const clientsById = new Map(clients.map((c) => [c.id, c]));

      const sessionRows = unwrapList(
        await supabase.from('workout_sessions').select(SESSION_COLUMNS),
      );
      const sessions = sessionRows.map((row) => sessionRowToDomain(row as unknown as SessionRow));

      const measurements = unwrapList(
        await supabase
          .from('body_measurements')
          .select('id, client_id, date, weight_kg')
          .order('date', { ascending: false })
          .limit(50),
      ) as { id: string; client_id: string; date: string; weight_kg: number }[];

      const messages = unwrapList(
        await supabase
          .from('messages')
          .select('id, client_id, sender, sent_at')
          .eq('sender', 'client')
          .order('sent_at', { ascending: false })
          .limit(20),
      ) as { id: string; client_id: string; sender: string; sent_at: string }[];

      const now = Date.now();
      const RECENT_WINDOW_MS = 30 * DAY_MS;
      const measurementTimes = measurements
        .map((m) => parseDdMmAaaa(isoToDdmmaaaa(m.date))?.getTime())
        .filter((t): t is number => t !== undefined);

      // --- recentActivity: sesiones + mediciones + mensajes de los últimos 30
      // días, más reciente primero.
      const activity: { at: number; item: ActivityItem }[] = [];
      for (const s of sessions) {
        const at = parseDdMmAaaa(s.date)?.getTime() ?? 0;
        const client = clientsById.get(s.clientId);
        activity.push({
          at,
          item: {
            id: `act_w_${s.id}`,
            kind: 'workout',
            actorName: client?.name ?? 'Cliente',
            clientId: s.clientId,
            entityId: s.id,
            action: `completó ${s.routineName}`,
            timeAgo: relativeDayLabel(at ? new Date(at) : null, 'Sin fecha'),
          },
        });
      }
      for (const m of measurements) {
        const at = parseDdMmAaaa(isoToDdmmaaaa(m.date))?.getTime() ?? 0;
        const client = clientsById.get(m.client_id);
        activity.push({
          at,
          item: {
            id: `act_m_${m.id}`,
            kind: 'weight',
            actorName: client?.name ?? 'Cliente',
            clientId: m.client_id,
            entityId: m.id,
            action: `registró peso: ${m.weight_kg} kg`,
            timeAgo: relativeDayLabel(at ? new Date(at) : null, 'Sin fecha'),
          },
        });
      }
      for (const msg of messages) {
        const at = Date.parse(msg.sent_at) || 0;
        const client = clientsById.get(msg.client_id);
        activity.push({
          at,
          item: {
            id: `act_c_${msg.id}`,
            kind: 'message',
            actorName: client?.name ?? 'Cliente',
            clientId: msg.client_id,
            entityId: msg.id,
            action: 'envió un mensaje',
            timeAgo: relativeDayLabel(at ? new Date(at) : null, 'Sin fecha'),
          },
        });
      }
      const recentActivity = activity
        .filter((a) => a.at >= now - RECENT_WINDOW_MS)
        .sort((a, b) => b.at - a.at);

      return {
        activeUsers: clients.length,
        stats: {
          week: statsForWindow(sessions, measurementTimes, now, 7),
          month: statsForWindow(sessions, measurementTimes, now, 30),
        },
        weeklyAchievements: buildAchievements(sessions, clientsById, now).filter(
          (a) => !dismissed.has(a.id),
        ),
        recentActivity: recentActivity
          .map((a) => a.item)
          .filter((item) => !dismissed.has(item.id))
          .slice(0, 12),
        upcomingSessions: [],
        dismissedCount: dismissed.size,
      };
    },

    async dismiss(itemKey: string): Promise<void> {
      const { error } = await supabase
        .from('dashboard_dismissals')
        .upsert({ item_key: itemKey }, { onConflict: 'coach_id,item_key', ignoreDuplicates: true });
      if (error) throw new Error(error.message);
    },

    async restoreDismissed(): Promise<void> {
      const uid = await currentUid();
      const { error } = await supabase
        .from('dashboard_dismissals')
        .delete()
        .eq('coach_id', uid);
      if (error) throw new Error(error.message);
    },
  };
}
