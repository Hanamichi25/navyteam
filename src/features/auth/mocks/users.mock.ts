import type { User } from '@/types/auth';

/**
 * Usuarios de prueba para el login mock.
 *
 * ⚠️ Fase actual: credenciales fake en memoria. No hay hashing ni backend.
 * TODO(backend): eliminar este archivo cuando el login use el proveedor de auth real.
 */

/** Usuario mock con contraseña en claro (solo válido para esta fase). */
export interface MockUser extends User {
  password: string;
}

export const MOCK_USERS: readonly MockUser[] = [
  {
    id: 'usr_001',
    name: 'Carlos Mendoza',
    email: 'entrenador@fitcoach.com',
    password: 'navyteam123',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    role: 'coach',
  },
  {
    id: 'usr_002',
    name: 'Lucía Ramírez',
    email: 'lucia@navyteam.com',
    password: 'coach2026',
    avatarUrl: 'https://i.pravatar.cc/150?img=45',
    role: 'coach',
  },
  {
    // Cliente demo (Fase 8): su sesión abre la vista de cliente, no el panel.
    // `clientId` apunta a un cliente del seed de `clients` (`CLIENT_DETAILS_SEED`).
    id: 'usr_003',
    name: 'Luis Fernández',
    email: 'cliente@navyteam.com',
    password: 'cliente2026',
    avatarUrl: 'https://i.pravatar.cc/150?img=13',
    role: 'client',
    clientId: 'cli_luis',
  },
];

/** Credencial de entrenador sugerida para demos rápidas. */
export const DEMO_CREDENTIALS = {
  email: 'entrenador@fitcoach.com',
  password: 'navyteam123',
} as const;

/** Credencial de cliente sugerida para probar la vista de cliente (Fase 8). */
export const CLIENT_DEMO_CREDENTIALS = {
  email: 'cliente@navyteam.com',
  password: 'cliente2026',
} as const;
