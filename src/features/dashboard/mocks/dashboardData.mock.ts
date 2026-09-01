import type { DashboardData } from '@/types/dashboard';

/**
 * Datos simulados del dashboard del entrenador.
 *
 * TODO(backend): reemplazar por `GET /dashboard` (o la query equivalente de Supabase).
 */

const DASHBOARD_DELAY_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DASHBOARD_DATA: DashboardData = {
  stats: [
    { id: 'stat_active_users', value: 12, label: 'Usuarios activos' },
    { id: 'stat_routines', value: 8, label: 'Rutinas creadas' },
    { id: 'stat_nutrition_plans', value: 5, label: 'Planes nutricionales' },
  ],
  recentActivity: [
    {
      id: 'act_001',
      actorName: 'María López',
      actorAvatarUrl: 'https://i.pravatar.cc/150?img=32',
      action: 'completó su rutina de piernas',
      timeAgo: 'Hace 10 min',
    },
    {
      id: 'act_002',
      actorName: 'Pedro García',
      actorAvatarUrl: 'https://i.pravatar.cc/150?img=15',
      action: 'actualizó su peso: 78kg',
      timeAgo: 'Hace 45 min',
    },
    {
      id: 'act_003',
      actorName: 'Ana Martínez',
      actorAvatarUrl: 'https://i.pravatar.cc/150?img=47',
      action: 'envió un mensaje',
      timeAgo: 'Hace 2 horas',
    },
  ],
  upcomingSessions: [
    {
      id: 'ses_001',
      clientName: 'Luis Fernández',
      clientAvatarUrl: 'https://i.pravatar.cc/150?img=13',
      time: '16:00',
      mode: 'Presencial',
      focus: 'Fuerza Tren Superior',
    },
    {
      id: 'ses_002',
      clientName: 'Sofía Ruiz',
      clientAvatarUrl: 'https://i.pravatar.cc/150?img=24',
      time: '18:30',
      mode: 'Online',
      focus: 'Cardio HIIT',
    },
  ],
};

/** Devuelve el dashboard del entrenador autenticado. */
export async function fetchMockDashboard(): Promise<DashboardData> {
  // TODO(backend): sustituir por la llamada real, filtrando por el id del coach.
  await delay(DASHBOARD_DELAY_MS);
  return DASHBOARD_DATA;
}
