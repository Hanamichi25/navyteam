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
];

/** Credencial sugerida para demos rápidas. */
export const DEMO_CREDENTIALS = {
  email: 'entrenador@fitcoach.com',
  password: 'navyteam123',
} as const;
