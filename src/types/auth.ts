/**
 * Tipos del dominio de autenticación.
 *
 * La forma de estos tipos anticipa la respuesta de un backend real
 * (Supabase u otro, ver docs/App_Fitness_RN_Expo_Especificaciones.md),
 * de modo que reemplazar los mocks sea un cambio de implementación y no de interfaz.
 */

/** Rol dentro de NavyTeam: entrenador (panel) o cliente (su propia vista). */
export type UserRole = 'coach' | 'client';

/** Usuario autenticado tal como lo consume la app (sin credenciales). */
export interface User {
  id: string;
  name: string;
  email: string;
  /** URL del avatar. En esta fase apunta a una imagen remota de placeholder. */
  avatarUrl: string;
  role: UserRole;
  /**
   * Solo para `role: 'client'`: id del `Client` correspondiente en el dominio de
   * clientes. Es lo que ata la sesión del cliente a sus datos (rutina/plan
   * asignados, sesiones registradas).
   */
  clientId?: string;
}

/** Credenciales que el formulario de login envía al servicio de auth. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Respuesta exitosa del login. */
export interface LoginSuccess {
  user: User;
}

/** Respuesta de error del login (credenciales inválidas, etc.). */
export interface LoginFailure {
  error: string;
}

export type LoginResult = LoginSuccess | LoginFailure;

/** Discrimina el resultado del login sin exponer la forma interna. */
export function isLoginSuccess(result: LoginResult): result is LoginSuccess {
  return 'user' in result;
}

/** Estados posibles del flujo de autenticación en la UI. */
export type AuthStatus = 'idle' | 'loading' | 'error' | 'success';

/**
 * Sesión vigente tal como la expone `AuthGateway`. `expiresAt` es epoch ms;
 * lo usa `authStore` para decidir cuándo llamar a `refresh()`.
 */
export interface Session {
  user: User;
  expiresAt: number;
}
