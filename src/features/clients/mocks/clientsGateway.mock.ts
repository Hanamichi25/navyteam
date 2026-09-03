import { addMonths, formatDdMmAaaa, parseDdMmAaaa } from '@/lib/date';
import { delay } from '@/lib/delay';
import { createId } from '@/lib/id';
import { readJSON, writeJSON } from '@/lib/storage';
import type {
  AssignedRoutine,
  BodyMeasurement,
  Client,
  ClientDetail,
  ClientInput,
  Payment,
} from '@/types/client';
import type { NutritionPlan } from '@/types/nutrition';
import type { Routine } from '@/types/routine';
import type { ClientsGateway } from '../gateway';
import { CLIENT_DETAILS_SEED } from './clients.mock';

const STORAGE_KEY = '@navyteam/clients';

/** Avatares de placeholder para clientes nuevos (mismo servicio que la semilla). */
function placeholderAvatarUrl(): string {
  const seed = Math.floor(Math.random() * 70) + 1;
  return `https://i.pravatar.cc/150?img=${seed}`;
}

/**
 * Rellena con valores por defecto los campos que la Fase 6 agregó a
 * `ClientDetail` (`measurements`, `birthDate`, ...). Sin esto, un cliente
 * guardado en AsyncStorage/localStorage por una versión anterior del mock
 * (Fases 3-5) llega con esos campos `undefined` y rompe el perfil (la
 * gráfica y el historial hacen `.length`/`.sort()` sobre `measurements`).
 * TODO(backend): un backend real no necesita esto — la migración de
 * esquema se hace con una migración de BD, no en el cliente.
 */
function normalizeClient(client: ClientDetail): ClientDetail {
  return {
    ...client,
    birthDate: client.birthDate ?? '',
    measurements: client.measurements ?? [],
    monthlyFeeEur: client.monthlyFeeEur ?? 0,
    subscriptionUntil: client.subscriptionUntil ?? null,
    payments: client.payments ?? [],
  };
}

async function readAll(): Promise<ClientDetail[]> {
  const all = await readJSON<ClientDetail[]>(STORAGE_KEY, Object.values(CLIENT_DETAILS_SEED));
  return all.map(normalizeClient);
}

function toListItem(detail: ClientDetail): Client {
  const { id, name, avatarUrl, goal, lastActivity, subscriptionUntil } = detail;
  return { id, name, avatarUrl, goal, lastActivity, subscriptionUntil };
}

function formatMemberSince(date: Date): string {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/** IMC = peso (kg) / altura (m)², redondeado a 1 decimal. */
function computeBmi(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
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
      // El peso "vigente" arranca en 0 hasta que se registre el primer pesaje
      // vía addMeasurement (el editor de alta lo encadena automáticamente con
      // el "Peso inicial" del formulario).
      const detail: ClientDetail = {
        ...input,
        id: createId('cli'),
        avatarUrl: placeholderAvatarUrl(),
        lastActivity: 'Sin actividad aún',
        memberSince: formatMemberSince(new Date()),
        weightKg: 0,
        bmi: 0,
        weightProgress: { startKg: 0, currentKg: 0, goalKg: input.goalKg },
        measurements: [],
        assignedRoutines: [],
        assignedPlan: null,
        subscriptionUntil: null,
        payments: [],
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
      const current = all[index]!;
      const nextHeightCm = input.heightCm ?? current.heightCm;
      const updated: ClientDetail = {
        ...current,
        ...input,
        // La meta de peso se actualiza vía `goalKg`; el peso vigente
        // (startKg/currentKg) solo cambia por addMeasurement.
        weightProgress: {
          ...current.weightProgress,
          goalKg: input.goalKg ?? current.weightProgress.goalKg,
        },
        bmi: computeBmi(current.weightKg, nextHeightCm),
      };
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

    async addMeasurement(clientId: string, input: Omit<BodyMeasurement, 'id'>) {
      await delay(500);
      const all = await readAll();
      const index = all.findIndex((client) => client.id === clientId);
      if (index === -1) {
        throw new Error(`Cliente no encontrado: ${clientId}`);
      }
      const client = all[index]!;
      const measurement: BodyMeasurement = { ...input, id: createId('msr') };
      const isFirstMeasurement = client.measurements.length === 0;
      const updated: ClientDetail = {
        ...client,
        measurements: [...client.measurements, measurement],
        weightKg: measurement.weightKg,
        bmi: computeBmi(measurement.weightKg, client.heightCm),
        weightProgress: {
          ...client.weightProgress,
          // El primer pesaje registrado también fija el punto de partida.
          startKg: isFirstMeasurement ? measurement.weightKg : client.weightProgress.startKg,
          currentKg: measurement.weightKg,
        },
      };
      const next = [...all];
      next[index] = updated;
      await writeJSON(STORAGE_KEY, next);
      return updated;
    },

    async registerPayment(clientId, input) {
      await delay(500);
      const all = await readAll();
      const index = all.findIndex((client) => client.id === clientId);
      if (index === -1) {
        throw new Error(`Cliente no encontrado: ${clientId}`);
      }
      const client = all[index]!;
      // Un pago extiende desde el máximo entre hoy y la vigencia actual: si la
      // suscripción sigue viva, se suma al final; si ya venció, arranca hoy.
      const now = new Date();
      const currentUntil = client.subscriptionUntil
        ? parseDdMmAaaa(client.subscriptionUntil)
        : null;
      const base =
        currentUntil && currentUntil.getTime() > now.getTime() ? currentUntil : now;
      const coversUntil = formatDdMmAaaa(addMonths(base, input.months));
      const payment: Payment = {
        id: createId('pay'),
        date: input.date,
        amountEur: input.amountEur,
        months: input.months,
        coversUntil,
      };
      const updated: ClientDetail = {
        ...client,
        subscriptionUntil: coversUntil,
        payments: [...client.payments, payment],
      };
      const next = [...all];
      next[index] = updated;
      await writeJSON(STORAGE_KEY, next);
      return updated;
    },
  };
}
