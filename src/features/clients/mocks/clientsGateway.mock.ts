import { delay } from '@/lib/delay';
import { createId } from '@/lib/id';
import { readJSON, writeJSON } from '@/lib/storage';
import type { AssignedRoutine, Client, ClientDetail, ClientInput } from '@/types/client';
import type { NutritionPlan } from '@/types/nutrition';
import type { Routine } from '@/types/routine';
import type { ClientsGateway } from '../gateway';
import { CLIENT_DETAILS_SEED } from './clients.mock';

const STORAGE_KEY = '@navyteam/clients';

async function readAll(): Promise<ClientDetail[]> {
  return readJSON<ClientDetail[]>(STORAGE_KEY, Object.values(CLIENT_DETAILS_SEED));
}

function toListItem(detail: ClientDetail): Client {
  const { id, name, avatarUrl, goal, lastActivity } = detail;
  return { id, name, avatarUrl, goal, lastActivity };
}

function formatMemberSince(date: Date): string {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Implementación mock del `ClientsGateway`: persiste en AsyncStorage,
 * sembrando desde `clients.mock.ts` la primera vez. Simula latencia y
 * conserva el caso de error de `get()` sobre un id inexistente.
 */
export function createMockClientsGateway(): ClientsGateway {
  return {
    async list() {
      await delay(600);
      const all = await readAll();
      return all.map(toListItem);
    },

    async get(id) {
      await delay(500);
      const all = await readAll();
      const detail = all.find((client) => client.id === id);
      if (!detail) {
        throw new Error(`Cliente no encontrado: ${id}`);
      }
      return detail;
    },

    async create(input: ClientInput) {
      await delay(600);
      const all = await readAll();
      // TODO(Fase 6): estos campos los completará el editor real de clientes.
      const detail: ClientDetail = {
        ...input,
        id: createId('cli'),
        memberSince: formatMemberSince(new Date()),
        weightKg: 0,
        heightCm: 0,
        bmi: 0,
        weightProgress: { startKg: 0, currentKg: 0, goalKg: 0 },
        assignedRoutines: [],
        assignedPlan: null,
      };
      await writeJSON(STORAGE_KEY, [...all, detail]);
      return detail;
    },

    async update(id, input) {
      await delay(600);
      const all = await readAll();
      const index = all.findIndex((client) => client.id === id);
      if (index === -1) {
        throw new Error(`Cliente no encontrado: ${id}`);
      }
      const updated: ClientDetail = { ...all[index]!, ...input };
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
        all.filter((client) => client.id !== id),
      );
    },

    async assignRoutine(clientId: string, routine: Routine, schedule: string) {
      await delay(500);
      const all = await readAll();
      const index = all.findIndex((client) => client.id === clientId);
      if (index === -1) {
        throw new Error(`Cliente no encontrado: ${clientId}`);
      }
      const client = all[index]!;
      if (client.assignedRoutines.some((assigned) => assigned.id === routine.id)) {
        return client;
      }
      const assignedRoutine: AssignedRoutine = {
        id: routine.id,
        name: routine.name,
        schedule,
        exerciseCount: routine.exerciseCount,
        durationMin: routine.durationMin,
      };
      const updated: ClientDetail = {
        ...client,
        assignedRoutines: [...client.assignedRoutines, assignedRoutine],
      };
      const next = [...all];
      next[index] = updated;
      await writeJSON(STORAGE_KEY, next);
      // TODO(backend): en un backend real esto también incrementaría
      // `assignedCount` en el catálogo de rutinas (join en servidor).
      return updated;
    },

    async unassignRoutine(clientId: string, routineId: string) {
      await delay(400);
      const all = await readAll();
      const index = all.findIndex((client) => client.id === clientId);
      if (index === -1) {
        throw new Error(`Cliente no encontrado: ${clientId}`);
      }
      const client = all[index]!;
      const updated: ClientDetail = {
        ...client,
        assignedRoutines: client.assignedRoutines.filter((assigned) => assigned.id !== routineId),
      };
      const next = [...all];
      next[index] = updated;
      await writeJSON(STORAGE_KEY, next);
      return updated;
    },

    async assignPlan(clientId: string, plan: NutritionPlan) {
      await delay(500);
      const all = await readAll();
      const index = all.findIndex((client) => client.id === clientId);
      if (index === -1) {
        throw new Error(`Cliente no encontrado: ${clientId}`);
      }
      const updated: ClientDetail = {
        ...all[index]!,
        assignedPlan: { id: plan.id, name: plan.name, kcalPerDay: plan.kcalPerDay },
      };
      const next = [...all];
      next[index] = updated;
      await writeJSON(STORAGE_KEY, next);
      // TODO(backend): en un backend real esto también actualizaría
      // `assignedCount` en el catálogo de planes (join en servidor).
      return updated;
    },

    async unassignPlan(clientId: string) {
      await delay(400);
      const all = await readAll();
      const index = all.findIndex((client) => client.id === clientId);
      if (index === -1) {
        throw new Error(`Cliente no encontrado: ${clientId}`);
      }
      const updated: ClientDetail = { ...all[index]!, assignedPlan: null };
      const next = [...all];
      next[index] = updated;
      await writeJSON(STORAGE_KEY, next);
      return updated;
    },
  };
}
