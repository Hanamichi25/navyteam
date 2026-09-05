import type { LoginCredentials, LoginResult, Session } from '@/types/auth';

/**
 * Interfaz de infraestructura que necesita el módulo "auth".
 *
 * `authStore` recibe una implementación por inyección (`app/_layout.tsx`),
 * nunca importa `mockAuthGateway` ni `supabaseAuthGateway` directamente.
 */
export interface AuthGateway {
  signIn(credentials: LoginCredentials): Promise<LoginResult>;
  signOut(): Promise<void>;
  /** Sesión vigente (desde el token persistido), o `null` si no hay ninguna. */
  getSession(): Promise<Session | null>;
  /** Refresca la sesión vigente. `null` si el refresh token ya no es válido. */
  refresh(): Promise<Session | null>;
}
