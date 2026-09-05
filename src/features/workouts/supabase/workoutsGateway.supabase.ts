import { ddmmaaaaToIso, isoToDdmmaaaa, parseDdMmAaaa } from '@/lib/date';
import { createId } from '@/lib/id';
import { supabase } from '@/lib/supabase';
import { unwrapList, unwrapRequired } from '@/lib/supabaseQuery';
import type { ExerciseLog, SetLog, WorkoutSession, WorkoutSessionInput } from '@/types/workout';
import type { WorkoutsGateway } from '../gateway';
import {
  buildExerciseProgress,
  buildTrainingSummary,
  listTrainedExercises,
  summarizeSession,
} from '../progress';

/**
 * Implementación real de `WorkoutsGateway` sobre Supabase (`workout_sessions`
 * → `workout_exercise_logs` → `workout_set_logs`). Las lecturas derivadas
 * (progreso por ejercicio, adherencia, resumen de sesión) **reutilizan las
 * funciones puras de `progress.ts`**: se traen las `WorkoutSession[]` crudas y
 * se calcula en cliente, igual que hacía el mock.
 *
 * RLS: el coach tiene control total sobre las sesiones de sus clientes; el
 * cliente lee y crea las suyas, pero no las borra ni edita.
 */

interface SetRow {
  set_number: number;
  reps: number;
  weight_kg: number;
  rpe: number | null;
}

interface ExerciseLogRow {
  id: string;
  exercise_id: string | null;
  exercise_name: string;
  position: number;
  workout_set_logs: SetRow[];
}

interface SessionRow {
  id: string;
  client_id: string;
  routine_id: string | null;
  routine_name: string;
  date: string;
  duration_min: number | null;
  notes: string | null;
  workout_exercise_logs: ExerciseLogRow[];
}

const SESSION_COLUMNS = `
  id, client_id, routine_id, routine_name, date, duration_min, notes,
  workout_exercise_logs(id, exercise_id, exercise_name, position,
    workout_set_logs(set_number, reps, weight_kg, rpe))
`;

function setRowToDomain(row: SetRow): SetLog {
  return {
    setNumber: row.set_number,
    reps: row.reps,
    weightKg: row.weight_kg,
    ...(row.rpe != null ? { rpe: row.rpe } : {}),
  };
}

function logRowToDomain(row: ExerciseLogRow): ExerciseLog {
  return {
    id: row.id,
    exerciseId: row.exercise_id ?? '',
    exerciseName: row.exercise_name,
    sets: (row.workout_set_logs ?? [])
      .slice()
      .sort((a, b) => a.set_number - b.set_number)
      .map(setRowToDomain),
  };
}

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
      .map(logRowToDomain),
  };
}

async function readByClient(clientId: string): Promise<WorkoutSession[]> {
  const rows = unwrapList(
    await supabase.from('workout_sessions').select(SESSION_COLUMNS).eq('client_id', clientId),
  );
  return rows.map((row) => sessionRowToDomain(row as unknown as SessionRow));
}

export function createSupabaseWorkoutsGateway(): WorkoutsGateway {
  return {
    async listByClient(clientId) {
      const sessions = await readByClient(clientId);
      return sessions
        .map(summarizeSession)
        .sort((a, b) => {
          const ta = parseDdMmAaaa(a.date)?.getTime() ?? 0;
          const tb = parseDdMmAaaa(b.date)?.getTime() ?? 0;
          return tb - ta;
        });
    },

    async get(sessionId) {
      const row = unwrapRequired(
        await supabase.from('workout_sessions').select(SESSION_COLUMNS).eq('id', sessionId).single(),
        `Sesión no encontrada: ${sessionId}`,
      );
      return sessionRowToDomain(row as unknown as SessionRow);
    },

    async create(input: WorkoutSessionInput) {
      const sessionId = createId('wko');
      const session = await supabase.from('workout_sessions').insert({
        id: sessionId,
        client_id: input.clientId,
        routine_id: input.routineId || null,
        routine_name: input.routineName,
        date: ddmmaaaaToIso(input.date) ?? input.date,
        duration_min: input.durationMin ?? null,
        notes: input.notes ?? null,
      });
      if (session.error) throw new Error(session.error.message);

      const logRows = input.exercises.map((exercise, position) => ({
        id: createId('exl'),
        session_id: sessionId,
        exercise_id: exercise.exerciseId || null,
        exercise_name: exercise.exerciseName,
        position,
      }));
      if (logRows.length > 0) {
        const logs = await supabase.from('workout_exercise_logs').insert(logRows);
        if (logs.error) throw new Error(logs.error.message);

        const setRows = input.exercises.flatMap((exercise, i) =>
          exercise.sets.map((set) => ({
            id: createId('set'),
            exercise_log_id: logRows[i]!.id,
            set_number: set.setNumber,
            reps: set.reps,
            weight_kg: set.weightKg,
            rpe: set.rpe ?? null,
          })),
        );
        if (setRows.length > 0) {
          const sets = await supabase.from('workout_set_logs').insert(setRows);
          if (sets.error) throw new Error(sets.error.message);
        }
      }

      const row = unwrapRequired(
        await supabase.from('workout_sessions').select(SESSION_COLUMNS).eq('id', sessionId).single(),
        `Sesión no encontrada: ${sessionId}`,
      );
      return sessionRowToDomain(row as unknown as SessionRow);
    },

    async remove(sessionId) {
      const { error } = await supabase.from('workout_sessions').delete().eq('id', sessionId);
      if (error) throw new Error(error.message);
    },

    async trainedExercises(clientId) {
      return listTrainedExercises(await readByClient(clientId));
    },

    async exerciseProgress(clientId, exerciseId) {
      return buildExerciseProgress(exerciseId, await readByClient(clientId));
    },

    async trainingSummary(clientId) {
      return buildTrainingSummary(await readByClient(clientId));
    },
  };
}
