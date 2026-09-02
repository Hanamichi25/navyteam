import type { DashboardData } from '@/types/dashboard';

/**
 * Datos semilla del dashboard, usados por `dashboardGateway.mock.ts`.
 *
 * TODO(backend): reemplazar por `GET /dashboard` (o la query equivalente de
 * Supabase). Las métricas por periodo, los logros, el feed y las sesiones se
 * derivarán de `clients` + `workouts` en la Fase 10 (p.ej. `weeklyAchievements`
 * sale de comparar los PRs de `progress.ts` con la fecha de cada récord).
 */
export const DASHBOARD_DATA_SEED: DashboardData = {
  activeUsers: 12,
  stats: {
    week: [
      { id: 'sessions', label: 'Sesiones registradas', value: 9, delta: 2, trend: 'up' },
      { id: 'clients_trained', label: 'Clientes entrenados', value: 6, delta: 1, trend: 'up' },
      { id: 'measurements', label: 'Mediciones nuevas', value: 4, delta: 0, trend: 'flat' },
    ],
    month: [
      { id: 'sessions', label: 'Sesiones registradas', value: 34, delta: 6, trend: 'up' },
      { id: 'clients_trained', label: 'Clientes entrenados', value: 11, delta: 1, trend: 'up' },
      { id: 'measurements', label: 'Mediciones nuevas', value: 15, delta: -3, trend: 'down' },
    ],
  },
  weeklyAchievements: [
    {
      id: 'ach_001',
      clientId: 'cli_maria',
      clientName: 'María López',
      clientAvatarUrl: 'https://i.pravatar.cc/150?img=32',
      kind: 'weight_pr',
      exerciseId: 'exc_squat',
      detail: 'Sentadilla — 50 kg, nuevo récord de carga',
    },
    {
      id: 'ach_002',
      clientId: 'cli_pedro',
      clientName: 'Pedro García',
      clientAvatarUrl: 'https://i.pravatar.cc/150?img=15',
      kind: 'e1rm_pr',
      exerciseId: 'exc_bench_press',
      detail: 'Press de banca — 78 kg de 1RM estimado',
    },
    {
      id: 'ach_003',
      clientId: 'cli_maria',
      clientName: 'María López',
      clientAvatarUrl: 'https://i.pravatar.cc/150?img=32',
      kind: 'streak',
      detail: '5 semanas seguidas entrenando',
    },
    {
      id: 'ach_004',
      clientId: 'cli_luis',
      clientName: 'Luis Fernández',
      clientAvatarUrl: 'https://i.pravatar.cc/150?img=13',
      kind: 'volume_pr',
      detail: 'Fuerza Superior — 3.200 kg, su mayor volumen en una sesión',
    },
  ],
  recentActivity: [
    {
      id: 'act_001',
      kind: 'workout',
      actorName: 'María López',
      clientId: 'cli_maria',
      action: 'completó su rutina de piernas',
      timeAgo: 'Hace 10 min',
    },
    {
      id: 'act_002',
      kind: 'weight',
      actorName: 'Pedro García',
      clientId: 'cli_pedro',
      action: 'registró peso: 78 kg',
      timeAgo: 'Hace 45 min',
    },
    {
      id: 'act_003',
      kind: 'message',
      actorName: 'Ana Martínez',
      clientId: 'cli_ana',
      action: 'envió un mensaje',
      timeAgo: 'Hace 2 horas',
    },
    {
      id: 'act_004',
      kind: 'workout',
      actorName: 'Luis Fernández',
      clientId: 'cli_luis',
      action: 'completó Fuerza Superior',
      timeAgo: 'Ayer, 19:20',
    },
  ],
  upcomingSessions: [
    {
      id: 'ses_001',
      clientId: 'cli_luis',
      clientName: 'Luis Fernández',
      clientAvatarUrl: 'https://i.pravatar.cc/150?img=13',
      time: '16:00',
      mode: 'Presencial',
      focus: 'Fuerza Tren Superior',
      detail: 'Rutina asignada · 5 ejercicios · última sesión hace 4 días',
    },
    {
      id: 'ses_002',
      clientId: 'cli_sofia',
      clientName: 'Sofía Ruiz',
      clientAvatarUrl: 'https://i.pravatar.cc/150?img=24',
      time: '18:30',
      mode: 'Online',
      focus: 'Cardio HIIT',
      detail: 'Plan: Déficit Calórico · 1.800 kcal',
    },
  ],
};
