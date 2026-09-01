import type { LoginCredentials, LoginResult } from '@/types/auth';
import { MOCK_USERS } from './users.mock';

/**
 * Servicio de autenticación simulado.
 *
 * Imita la forma de una API real (async, latencia, caso de error) para que el
 * cambio futuro a backend real sea solo de implementación.
 *
 * TODO(backend): reemplazar el cuerpo de `mockLogin` por una llamada al proveedor
 * de auth real (Supabase Auth u otro). La firma de entrada/salida no debe cambiar.
 */

const NETWORK_DELAY_MS = 800;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Valida credenciales contra los usuarios mock.
 *
 * @returns `{ user }` si las credenciales coinciden, `{ error }` en caso contrario.
 */
export async function mockLogin({
  email,
  password,
}: LoginCredentials): Promise<LoginResult> {
  // TODO(backend): sustituir por `await supabase.auth.signInWithPassword(...)`.
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
  return { user };
}

/**
 * Cierra la sesión.
 *
 * TODO(backend): revocar el refresh token en el backend y limpiar `expo-secure-store`.
 */
export async function mockLogout(): Promise<void> {
  await delay(300);
}
