import { delay } from '@/lib/delay';
import { createId } from '@/lib/id';
import { readJSON, writeJSON } from '@/lib/storage';
import type { Exercise, ExerciseInput } from '@/types/exercise';
import type { ExercisesGateway } from '../gateway';
import { EXERCISES_SEED } from './exercises.mock';

const STORAGE_KEY = '@navyteam/exercises';

async function readAll(): Promise<Exercise[]> {
  return readJSON<Exercise[]>(STORAGE_KEY, [...EXERCISES_SEED]);
}

/**
 * Implementación mock del `ExercisesGateway`: persiste en AsyncStorage,
 * sembrando desde `exercises.mock.ts` la primera vez.
 */
export function createMockExercisesGateway(): ExercisesGateway {
  return {
    async list() {
      await delay(600);
      return readAll();
    },

    async create(input: ExerciseInput) {
      await delay(600);
      const all = await readAll();
      const exercise: Exercise = { ...input, id: createId('exc') };
      await writeJSON(STORAGE_KEY, [...all, exercise]);
      return exercise;
    },

    async update(id, input) {
      await delay(600);
      const all = await readAll();
      const index = all.findIndex((exercise) => exercise.id === id);
      if (index === -1) {
        throw new Error(`Ejercicio no encontrado: ${id}`);
      }
      const updated: Exercise = { ...all[index]!, ...input };
      const next = [...all];
      next[index] = updated;
      await writeJSON(STORAGE_KEY, next);
      return updated;
    },

    async remove(id) {
      await delay(400);
      const all = await readAll();
      await writeJSON(
        STORAGE_KEY,
        all.filter((exercise) => exercise.id !== id),
      );
    },
  };
}
