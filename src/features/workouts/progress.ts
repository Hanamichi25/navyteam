/**
 * Lógica pura de derivación del seguimiento de entrenamientos: sin I/O, sin
 * React. La usa `workoutsGateway.mock.ts` y sería reutilizable por una
 * implementación real de servidor que quiera calcular lo mismo en cliente.
 */

import { parseDdMmAaaa } from '@/lib/date';
import type {
  ClientTrainingSummary,
  ExerciseLog,
  ExerciseProgress,
  ExerciseProgressPoint,
  ExerciseTrainedSummary,
  SetLog,
  WorkoutSession,
  WorkoutSessionSummary,
} from '@/types/workout';

/** Redondea a 1 decimal. */
function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** 1RM estimado por la fórmula de Epley: `peso × (1 + reps / 30)`. */
export function epley1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return weightKg;
  return weightKg * (1 + reps / 30);
}

/** Volumen de una lista de series: Σ reps × peso. */
function setsVolume(sets: SetLog[]): number {
  return sets.reduce((sum, set) => sum + set.reps * set.weightKg, 0);
}

/** Volumen total de una sesión (todos los ejercicios). */
export function sessionVolumeKg(session: WorkoutSession): number {
  return session.exercises.reduce((sum, log) => sum + setsVolume(log.sets), 0);
}

/** Resumen de una sesión para el historial. */
export function summarizeSession(session: WorkoutSession): WorkoutSessionSummary {
  const setCount = session.exercises.reduce((n, log) => n + log.sets.length, 0);
  return {
    id: session.id,
    clientId: session.clientId,
    date: session.date,
    routineName: session.routineName,
    exerciseCount: session.exercises.length,
    setCount,
    totalVolumeKg: sessionVolumeKg(session),
  };
}

/** Ordena sesiones por fecha ascendente (las de fecha inválida van al final). */
function byDateAsc(a: WorkoutSession, b: WorkoutSession): number {
  const da = parseDdMmAaaa(a.date)?.getTime() ?? Number.POSITIVE_INFINITY;
  const db = parseDdMmAaaa(b.date)?.getTime() ?? Number.POSITIVE_INFINITY;
  return da - db;
}

/** Serie temporal de progreso de un ejercicio a partir de las sesiones del cliente. */
export function buildExerciseProgress(
  exerciseId: string,
  sessions: WorkoutSession[],
): ExerciseProgress {
  const relevant: { date: string; log: ExerciseLog }[] = [];
  for (const session of [...sessions].sort(byDateAsc)) {
    const log = session.exercises.find((entry) => entry.exerciseId === exerciseId);
    if (log && log.sets.length > 0) relevant.push({ date: session.date, log });
  }

  const points: ExerciseProgressPoint[] = relevant.map(({ date, log }) => ({
    date,
    topWeightKg: Math.max(...log.sets.map((set) => set.weightKg)),
    totalVolumeKg: setsVolume(log.sets),
    estimated1RM: round1(Math.max(...log.sets.map((set) => epley1RM(set.weightKg, set.reps)))),
  }));

  const exerciseName = relevant[relevant.length - 1]?.log.exerciseName ?? '';
  const max = (pick: (point: ExerciseProgressPoint) => number): number =>
    points.length === 0 ? 0 : Math.max(...points.map(pick));

  return {
    exerciseId,
    exerciseName,
    points,
    prWeightKg: max((point) => point.topWeightKg),
    prVolumeKg: max((point) => point.totalVolumeKg),
    prEstimated1RM: max((point) => point.estimated1RM),
  };
}

/** Lista de ejercicios entrenados por el cliente, con su resumen, más reciente primero. */
export function listTrainedExercises(sessions: WorkoutSession[]): ExerciseTrainedSummary[] {
  interface Acc {
    exerciseName: string;
    sessionIds: Set<string>;
    lastTime: number;
    lastDate: string;
    bestWeightKg: number;
  }
  const byExercise = new Map<string, Acc>();

  for (const session of sessions) {
    const time = parseDdMmAaaa(session.date)?.getTime() ?? 0;
    for (const log of session.exercises) {
      if (log.sets.length === 0) continue;
      const acc = byExercise.get(log.exerciseId) ?? {
        exerciseName: log.exerciseName,
        sessionIds: new Set<string>(),
        lastTime: -1,
        lastDate: session.date,
        bestWeightKg: 0,
      };
      acc.exerciseName = log.exerciseName;
      acc.sessionIds.add(session.id);
      acc.bestWeightKg = Math.max(acc.bestWeightKg, ...log.sets.map((set) => set.weightKg));
      if (time >= acc.lastTime) {
        acc.lastTime = time;
        acc.lastDate = session.date;
      }
      byExercise.set(log.exerciseId, acc);
    }
  }

  return [...byExercise.entries()]
    .map(([exerciseId, acc]) => ({
      exerciseId,
      exerciseName: acc.exerciseName,
      sessionCount: acc.sessionIds.size,
      lastDate: acc.lastDate,
      bestWeightKg: acc.bestWeightKg,
    }))
    .sort((a, b) => {
      const ta = parseDdMmAaaa(a.lastDate)?.getTime() ?? 0;
      const tb = parseDdMmAaaa(b.lastDate)?.getTime() ?? 0;
      return tb - ta;
    });
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
/** 1970-01-05 fue lunes: referencia para numerar semanas ISO. */
const MONDAY_EPOCH_UTC = Date.UTC(1970, 0, 5);

/** Índice de semana (lunes-domingo) de una fecha, en UTC para evitar saltos de DST. */
function weekIndex(date: Date): number {
  const dayUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((dayUtc - MONDAY_EPOCH_UTC) / WEEK_MS);
}

/** Resumen de adherencia del cliente (sin porcentaje: no hay agenda esperada). */
export function buildTrainingSummary(
  sessions: WorkoutSession[],
  now: Date = new Date(),
): ClientTrainingSummary {
  const dated = sessions
    .map((session) => ({ session, date: parseDdMmAaaa(session.date) }))
    .filter((entry): entry is { session: WorkoutSession; date: Date } => entry.date !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const sessionsThisMonth = dated.filter(
    ({ date }) =>
      date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(),
  ).length;

  const trainedWeeks = new Set(dated.map(({ date }) => weekIndex(date)));
  let week = weekIndex(now);
  // Gracia para la semana en curso: si aún no entrenó esta semana, la racha
  // puede seguir viva desde la semana pasada.
  if (!trainedWeeks.has(week)) week -= 1;
  let currentStreakWeeks = 0;
  while (trainedWeeks.has(week)) {
    currentStreakWeeks += 1;
    week -= 1;
  }

  return {
    totalSessions: sessions.length,
    sessionsThisMonth,
    lastSessionDate: dated[0]?.session.date ?? null,
    currentStreakWeeks,
  };
}
