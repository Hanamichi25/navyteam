import type { SetLog, WorkoutSession } from '@/types/workout';

/**
 * Datos semilla de sesiones de entrenamiento, usados por
 * `workoutsGateway.mock.ts` para sembrar AsyncStorage la primera vez.
 *
 * Traen progresión de carga real (la sentadilla de María sube 40→50 kg, el
 * press de Pedro 60→67 kg) y fechas cercanas a "hoy" del proyecto
 * (2026-09-01) para que las gráficas y la racha de adherencia tengan forma.
 * IDs de cliente de `clients.mock.ts`; de ejercicio de `exercises.mock.ts`.
 *
 * TODO(backend): estos datos desaparecen al conectar el backend real (Fase 9).
 */

/** Construye `count` series iguales con numeración 1..count. */
function sets(count: number, reps: number, weightKg: number, rpe?: number): SetLog[] {
  return Array.from({ length: count }, (_, i) => ({
    setNumber: i + 1,
    reps,
    weightKg,
    ...(rpe === undefined ? {} : { rpe }),
  }));
}

function legDay(
  id: string,
  date: string,
  squatKg: number,
  squatRpe: number,
  lungeKg: number,
  notes?: string,
  durationMin = 54,
): WorkoutSession {
  return {
    id,
    clientId: 'cli_maria',
    routineId: 'rtn_001',
    routineName: 'Piernas y Glúteos',
    date,
    durationMin,
    ...(notes ? { notes } : {}),
    exercises: [
      { id: `${id}_squat`, exerciseId: 'exc_squat', exerciseName: 'Sentadilla', sets: sets(4, 8, squatKg, squatRpe) },
      { id: `${id}_lunges`, exerciseId: 'exc_lunges', exerciseName: 'Zancadas', sets: sets(3, 10, lungeKg) },
    ],
  };
}

function upperDay(
  id: string,
  date: string,
  benchKg: number,
  benchReps: number,
  rowKg: number,
  notes?: string,
  durationMin = 47,
): WorkoutSession {
  return {
    id,
    clientId: 'cli_pedro',
    routineId: 'rtn_003',
    routineName: 'Fuerza Superior',
    date,
    durationMin,
    ...(notes ? { notes } : {}),
    exercises: [
      { id: `${id}_bench`, exerciseId: 'exc_bench_press', exerciseName: 'Press de banca', sets: sets(4, benchReps, benchKg, 8) },
      { id: `${id}_row`, exerciseId: 'exc_barbell_row', exerciseName: 'Remo con barra', sets: sets(4, 8, rowKg) },
    ],
  };
}

export const WORKOUT_SESSIONS_SEED: readonly WorkoutSession[] = [
  legDay('wko_maria_1', '25/07/2026', 40, 7, 12, undefined, 58),
  legDay('wko_maria_2', '08/08/2026', 42, 7, 12, 'Subió 2 kg en sentadilla sin problema.', 52),
  legDay('wko_maria_3', '15/08/2026', 45, 8, 14, undefined, 55),
  legDay('wko_maria_4', '22/08/2026', 48, 8, 14, undefined, 51),
  legDay('wko_maria_5', '29/08/2026', 50, 9, 16, 'PR de sentadilla a 50 kg.', 60),
  upperDay('wko_pedro_1', '20/07/2026', 60, 6, 50, undefined, 49),
  upperDay('wko_pedro_2', '10/08/2026', 62, 5, 52, undefined, 45),
  upperDay('wko_pedro_3', '27/08/2026', 67, 5, 55, 'PR de press de banca a 67 kg.', 46),
];
