import { delay } from '@/lib/delay';
import { createId } from '@/lib/id';
import { readJSON, writeJSON } from '@/lib/storage';
import type { Routine, RoutineDetail, RoutineInput } from '@/types/routine';
import type { RoutinesGateway } from '../gateway';
import { ROUTINES_SEED } from './routines.mock';

const STORAGE_KEY = '@navyteam/routines';

/** Semillas de imagen de portada para rutinas creadas desde el formulario. */
const PLACEHOLDER_IMAGE_SEEDS = ['strength', 'cardio', 'flex', 'core', 'fullbody'];

async function readAll(): Promise<RoutineDetail[]> {
  return readJSON<RoutineDetail[]>(STORAGE_KEY, [...ROUTINES_SEED]);
}

function toListItem(detail: RoutineDetail): Routine {
  const { id, name, category, level, durationMin, exerciseCount, assignedCount, imageUrl } = detail;
  return { id, name, category, level, durationMin, exerciseCount, assignedCount, imageUrl };
}

function placeholderImageUrl(): string {
  const seed = PLACEHOLDER_IMAGE_SEEDS[Math.floor(Math.random() * PLACEHOLDER_IMAGE_SEEDS.length)];
  return `https://picsum.photos/seed/navyteam-${seed}-${createId('img')}/640/360`;
}

/**
 * Implementación mock del `RoutinesGateway`: persiste en AsyncStorage,
 * sembrando desde `routines.mock.ts` la primera vez. Mismo patrón que
 * `clientsGateway.mock.ts` (lista resumida vs. detalle completo).
 */
export function createMockRoutinesGateway(): RoutinesGateway {
  return {
    async list() {
      await delay(600);
      const all = await readAll();
      return all.map(toListItem);
    },

    async get(id) {
      await delay(500);
      const all = await readAll();
      const detail = all.find((routine) => routine.id === id);
      if (!detail) {
        throw new Error(`Rutina no encontrada: ${id}`);
      }
      return detail;
    },

    async create(input: RoutineInput) {
      await delay(600);
      const all = await readAll();
      const detail: RoutineDetail = {
        ...input,
        id: createId('rtn'),
        assignedCount: 0,
        exerciseCount: input.blocks.length,
        imageUrl: placeholderImageUrl(),
      };
      await writeJSON(STORAGE_KEY, [...all, detail]);
      return detail;
    },

    async update(id, input) {
      await delay(600);
      const all = await readAll();
      const index = all.findIndex((routine) => routine.id === id);
      if (index === -1) {
        throw new Error(`Rutina no encontrada: ${id}`);
      }
      const merged: RoutineDetail = { ...all[index]!, ...input };
      if (input.blocks) {
        merged.exerciseCount = input.blocks.length;
      }
      const next = [...all];
      next[index] = merged;
      await writeJSON(STORAGE_KEY, next);
      return merged;
    },

    async remove(id) {
      await delay(400);
      const all = await readAll();
      await writeJSON(
        STORAGE_KEY,
        all.filter((routine) => routine.id !== id),
      );
    },
  };
}
