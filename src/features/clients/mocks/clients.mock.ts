import type { Client, ClientDetail } from '@/types/client';

/**
 * Datos semilla de clientes, usados por `clientsGateway.mock.ts` para
 * sembrar AsyncStorage la primera vez que se lee.
 *
 * TODO(backend): estos datos desaparecen al conectar el backend real (Fase 9).
 */

const CLIENTS: readonly Client[] = [
  {
    id: 'cli_maria',
    name: 'María López',
    avatarUrl: 'https://i.pravatar.cc/150?img=32',
    goal: 'weight_loss',
    lastActivity: 'Activa hoy',
  },
  {
    id: 'cli_pedro',
    name: 'Pedro García',
    avatarUrl: 'https://i.pravatar.cc/150?img=15',
    goal: 'muscle_gain',
    lastActivity: 'Activo ayer',
  },
  {
    id: 'cli_ana',
    name: 'Ana Martínez',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    goal: 'maintenance',
    lastActivity: 'Activa hace 2 días',
  },
  {
    id: 'cli_luis',
    name: 'Luis Fernández',
    avatarUrl: 'https://i.pravatar.cc/150?img=13',
    goal: 'muscle_gain',
    lastActivity: 'Activo hace 3 días',
  },
  {
    id: 'cli_sofia',
    name: 'Sofía Ruiz',
    avatarUrl: 'https://i.pravatar.cc/150?img=24',
    goal: 'weight_loss',
    lastActivity: 'Activa hace 5 días',
  },
];

export const CLIENT_DETAILS_SEED: Record<string, ClientDetail> = {
  cli_maria: {
    ...CLIENTS[0]!,
    memberSince: 'Ene 2025',
    weightKg: 65,
    heightCm: 168,
    bmi: 23.0,
    weightProgress: { startKg: 72, currentKg: 65, goalKg: 60 },
    assignedRoutines: [
      { id: 'rtn_001', name: 'Rutina de Piernas', schedule: 'Lun/Mié/Vie', exerciseCount: 8, durationMin: 45 },
      { id: 'rtn_002', name: 'Cardio HIIT', schedule: 'Mar/Jue', exerciseCount: 5, durationMin: 20 },
    ],
    assignedPlanName: 'Plan Déficit Calórico',
  },
  cli_pedro: {
    ...CLIENTS[1]!,
    memberSince: 'Nov 2024',
    weightKg: 78,
    heightCm: 175,
    bmi: 25.5,
    weightProgress: { startKg: 74, currentKg: 78, goalKg: 82 },
    assignedRoutines: [
      { id: 'rtn_003', name: 'Fuerza Superior', schedule: 'Lun/Jue', exerciseCount: 10, durationMin: 50 },
      { id: 'rtn_006', name: 'Empuje / Tirón', schedule: 'Mar/Vie', exerciseCount: 9, durationMin: 55 },
    ],
    assignedPlanName: 'Plan Volumen Limpio',
  },
  cli_ana: {
    ...CLIENTS[2]!,
    memberSince: 'Mar 2025',
    weightKg: 60,
    heightCm: 162,
    bmi: 22.9,
    weightProgress: { startKg: 61, currentKg: 60, goalKg: 60 },
    assignedRoutines: [
      { id: 'rtn_004', name: 'Flexibilidad Total', schedule: 'Lun/Mié/Vie', exerciseCount: 6, durationMin: 30 },
    ],
    assignedPlanName: 'Plan Mantenimiento Equilibrado',
  },
  cli_luis: {
    ...CLIENTS[3]!,
    memberSince: 'Ago 2024',
    weightKg: 82,
    heightCm: 180,
    bmi: 25.3,
    weightProgress: { startKg: 76, currentKg: 82, goalKg: 86 },
    assignedRoutines: [
      { id: 'rtn_003', name: 'Fuerza Superior', schedule: 'Lun/Mié/Vie', exerciseCount: 10, durationMin: 50 },
    ],
    assignedPlanName: 'Plan Volumen Limpio',
  },
  cli_sofia: {
    ...CLIENTS[4]!,
    memberSince: 'Feb 2025',
    weightKg: 58,
    heightCm: 165,
    bmi: 21.3,
    weightProgress: { startKg: 64, currentKg: 58, goalKg: 55 },
    assignedRoutines: [
      { id: 'rtn_002', name: 'Cardio HIIT', schedule: 'Lun/Mié/Vie', exerciseCount: 5, durationMin: 20 },
      { id: 'rtn_005', name: 'Cardio Quema Grasa', schedule: 'Sáb', exerciseCount: 7, durationMin: 35 },
    ],
    assignedPlanName: 'Plan Déficit Calórico',
  },
};
