import { secureStorage } from '@/lib/secureStorage';
import type { LoginCredentials, LoginResult, Session, User } from '@/types/auth';
import type { AuthGateway } from '../gateway';
import { MOCK_USERS } from './users.mock';

/**
 * Implementación mock de `AuthGateway`.
 *
 * Imita la forma de un backend real (async, latencia, sesión con expiración y
 * refresh, persistencia en `expo-secure-store`) para que el cambio a
 * `supabaseAuthGateway` sea solo de implementación.
 *
 * TODO(backend): este archivo se conserva como implementación de referencia
 * para tests y desarrollo offline (no se borra al conectar Supabase).
 */

const SESSION_KEY = 'navyteam.mock-session';
const NETWORK_DELAY_MS = 800;
const SESSION_TTL_MS = 1000 * 60 * 60; // 1h, para poder ejercitar refresh() en dev.

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface StoredSession {
  userId: string;
  expiresAt: number;
}

async function readStoredSession(): Promise<StoredSession | null> {
  const raw = await secureStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as StoredSession;
}

async function writeStoredSession(session: StoredSession | null): Promise<void> {
  if (!session) {
    await secureStorage.removeItem(SESSION_KEY);
    return;
  }
  await secureStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function findUser(userId: string): User | null {
  const match = MOCK_USERS.find((candidate) => candidate.id === userId);
  if (!match) return null;
  const { password: _password, ...user } = match;
  return user;
}

export function createMockAuthGateway(): AuthGateway {
  return {
    async signIn({ email, password }: LoginCredentials): Promise<LoginResult> {
      await delay(NETWORK_DELAY_MS);

      const normalizedEmail = email.trim().toLowerCase();
      const match = MOCK_USERS.find(
        (candidate) =>
          candidate.email.toLowerCase() === normalizedEmail &&
          candidate.password === password,
      );

      if (!match) {
        return { error: 'Correo o contraseña incorrectos' };
      }

      const { password: _password, ...user } = match;
      await writeStoredSession({ userId: user.id, expiresAt: Date.now() + SESSION_TTL_MS });
      return { user };
    },

    async signOut(): Promise<void> {
      await delay(300);
      await writeStoredSession(null);
    },

    async getSession(): Promise<Session | null> {
      const stored = await readStoredSession();
      if (!stored) return null;

      const user = findUser(stored.userId);
      if (!user) return null;

      return { user, expiresAt: stored.expiresAt };
    },

    async refresh(): Promise<Session | null> {
      await delay(300);
      const stored = await readStoredSession();
      if (!stored) return null;

      const user = findUser(stored.userId);
      if (!user) return null;

      const expiresAt = Date.now() + SESSION_TTL_MS;
      await writeStoredSession({ userId: stored.userId, expiresAt });
      return { user, expiresAt };
    },
  };
}
