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
    email: 'maria.lopez@correo.com',
    phone: '+34 611 222 333',
    birthDate: '14/03/1996',
    weightKg: 65,
    heightCm: 168,
    bmi: 23.0,
    weightProgress: { startKg: 72, currentKg: 65, goalKg: 60 },
    measurements: [
      { id: 'msr_maria_1', date: '05/01/2025', weightKg: 72 },
      { id: 'msr_maria_2', date: '10/03/2025', weightKg: 68 },
      { id: 'msr_maria_3', date: '20/05/2025', weightKg: 65 },
    ],
    assignedRoutines: [
      { id: 'rtn_001', name: 'Rutina de Piernas', schedule: 'Lun/Mié/Vie', exerciseCount: 8, durationMin: 45 },
      { id: 'rtn_002', name: 'Cardio HIIT', schedule: 'Mar/Jue', exerciseCount: 5, durationMin: 20 },
    ],
    assignedPlan: { id: 'nut_001', name: 'Plan Déficit Calórico', kcalPerDay: 1800 },
  },
  cli_pedro: {
    ...CLIENTS[1]!,
    memberSince: 'Nov 2024',
    email: 'pedro.garcia@correo.com',
    phone: '+34 622 333 444',
    birthDate: '22/07/1990',
    weightKg: 78,
    heightCm: 175,
    bmi: 25.5,
    weightProgress: { startKg: 74, currentKg: 78, goalKg: 82 },
    measurements: [
      { id: 'msr_pedro_1', date: '15/11/2024', weightKg: 74 },
      { id: 'msr_pedro_2', date: '10/02/2025', weightKg: 76 },
      { id: 'msr_pedro_3', date: '05/06/2025', weightKg: 78 },
    ],
    assignedRoutines: [
      { id: 'rtn_003', name: 'Fuerza Superior', schedule: 'Lun/Jue', exerciseCount: 10, durationMin: 50 },
      { id: 'rtn_006', name: 'Empuje / Tirón', schedule: 'Mar/Vie', exerciseCount: 9, durationMin: 55 },
    ],
    assignedPlan: { id: 'nut_002', name: 'Plan Volumen Limpio', kcalPerDay: 3200 },
  },
  cli_ana: {
    ...CLIENTS[2]!,
    memberSince: 'Mar 2025',
    email: 'ana.martinez@correo.com',
    phone: '+34 633 444 555',
    birthDate: '05/11/1988',
    weightKg: 60,
    heightCm: 162,
    bmi: 22.9,
    weightProgress: { startKg: 61, currentKg: 60, goalKg: 60 },
    measurements: [
      { id: 'msr_ana_1', date: '20/03/2025', weightKg: 61 },
      { id: 'msr_ana_2', date: '15/06/2025', weightKg: 60 },
    ],
    assignedRoutines: [
      { id: 'rtn_004', name: 'Flexibilidad Total', schedule: 'Lun/Mié/Vie', exerciseCount: 6, durationMin: 30 },
    ],
    assignedPlan: { id: 'nut_003', name: 'Plan Mantenimiento Equilibrado', kcalPerDay: 2400 },
  },
  cli_luis: {
    ...CLIENTS[3]!,
    memberSince: 'Ago 2024',
    email: 'luis.fernandez@correo.com',
    phone: '+34 644 555 666',
    birthDate: '30/01/1993',
    weightKg: 82,
    heightCm: 180,
    bmi: 25.3,
    weightProgress: { startKg: 76, currentKg: 82, goalKg: 86 },
    measurements: [
      { id: 'msr_luis_1', date: '01/08/2024', weightKg: 76 },
      { id: 'msr_luis_2', date: '01/01/2025', weightKg: 79 },
      { id: 'msr_luis_3', date: '01/07/2025', weightKg: 82 },
    ],
    assignedRoutines: [
      { id: 'rtn_003', name: 'Fuerza Superior', schedule: 'Lun/Mié/Vie', exerciseCount: 10, durationMin: 50 },
    ],
    assignedPlan: { id: 'nut_002', name: 'Plan Volumen Limpio', kcalPerDay: 3200 },
  },
  cli_sofia: {
    ...CLIENTS[4]!,
    memberSince: 'Feb 2025',
    email: 'sofia.ruiz@correo.com',
    phone: '+34 655 666 777',
    birthDate: '18/09/1998',
    weightKg: 58,
    heightCm: 165,
    bmi: 21.3,
    weightProgress: { startKg: 64, currentKg: 58, goalKg: 55 },
    measurements: [
      { id: 'msr_sofia_1', date: '10/02/2025', weightKg: 64 },
      { id: 'msr_sofia_2', date: '01/05/2025', weightKg: 61 },
      { id: 'msr_sofia_3', date: '01/08/2025', weightKg: 58 },
    ],
    assignedRoutines: [
      { id: 'rtn_002', name: 'Cardio HIIT', schedule: 'Lun/Mié/Vie', exerciseCount: 5, durationMin: 20 },
      { id: 'rtn_005', name: 'Cardio Quema Grasa', schedule: 'Sáb', exerciseCount: 7, durationMin: 35 },
    ],
    assignedPlan: { id: 'nut_001', name: 'Plan Déficit Calórico', kcalPerDay: 1800 },
  },
};
