import { parseDdMmAaaa } from '@/lib/date';
import { delay } from '@/lib/delay';
import { createId } from '@/lib/id';
import { readJSON, writeJSON } from '@/lib/storage';
import type {
  ExerciseLog,
  WorkoutSession,
  WorkoutSessionInput,
} from '@/types/workout';
import type { WorkoutsGateway } from '../gateway';
import {
  buildExerciseProgress,
  buildTrainingSummary,
  listTrainedExercises,
  summarizeSession,
} from '../progress';
import { WORKOUT_SESSIONS_SEED } from './workouts.mock';

const STORAGE_KEY = '@navyteam/workouts';

async function readAll(): Promise<WorkoutSession[]> {
  return readJSON<WorkoutSession[]>(STORAGE_KEY, [...WORKOUT_SESSIONS_SEED]);
}

async function readByClient(clientId: string): Promise<WorkoutSession[]> {
  const all = await readAll();
  return all.filter((session) => session.clientId === clientId);
}

/**
 * Implementación mock del `WorkoutsGateway`: persiste en AsyncStorage,
 * sembrando desde `workouts.mock.ts` la primera vez. Las lecturas derivadas
 * (progreso, adherencia) se calculan con `progress.ts`. Simula latencia y
 * conserva un caso de error en `get()` sobre un id inexistente.
 */
export function createMockWorkoutsGateway(): WorkoutsGateway {
  return {
    async listByClient(clientId) {
      await delay(500);
      const sessions = await readByClient(clientId);
      return sessions.map(summarizeSession).sort((a, b) => {
        const ta = parseDdMmAaaa(a.date)?.getTime() ?? 0;
        const tb = parseDdMmAaaa(b.date)?.getTime() ?? 0;
        return tb - ta;
      });
    },

    async get(sessionId) {
      await delay(400);
      const all = await readAll();
      const session = all.find((entry) => entry.id === sessionId);
      if (!session) {
        throw new Error(`Sesión no encontrada: ${sessionId}`);
      }
      return session;
    },

    async create(input: WorkoutSessionInput) {
      await delay(600);
      const all = await readAll();
      const exercises: ExerciseLog[] = input.exercises.map((exercise) => ({
        id: createId('exl'),
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        sets: exercise.sets,
      }));
      const session: WorkoutSession = {
        id: createId('wko'),
        clientId: input.clientId,
        routineId: input.routineId,
        routineName: input.routineName,
        date: input.date,
        ...(input.durationMin === undefined ? {} : { durationMin: input.durationMin }),
        ...(input.notes ? { notes: input.notes } : {}),
        exercises,
      };
      await writeJSON(STORAGE_KEY, [...all, session]);
      return session;
    },

    async remove(sessionId) {
      await delay(400);
      const all = await readAll();
      await writeJSON(
        STORAGE_KEY,
        all.filter((session) => session.id !== sessionId),
      );
    },

    async trainedExercises(clientId) {
      await delay(400);
      return listTrainedExercises(await readByClient(clientId));
    },

    async exerciseProgress(clientId, exerciseId) {
      await delay(400);
      return buildExerciseProgress(exerciseId, await readByClient(clientId));
    },

    async trainingSummary(clientId) {
      await delay(400);
      return buildTrainingSummary(await readByClient(clientId));
    },
  };
}
