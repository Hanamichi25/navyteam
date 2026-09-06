import type { Consent, ConsentRecord, LoginCredentials, LoginResult, Session } from '@/types/auth';

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
  /**
   * Consentimiento de política de datos del usuario actual, o `null` si nunca
   * lo aceptó. Requiere sesión.
   */
  getConsent(): Promise<Consent | null>;
  /** Registra que el usuario actual aceptó la versión indicada de la política. */
  acceptConsent(policyVersion: string): Promise<void>;
  /**
   * Registro auditable de aceptaciones que el usuario actual puede consultar:
   * la suya + (si es coach) la de sus clientes. Para exportar el reporte de
   * cumplimiento desde Configuración.
   */
  getConsentReport(): Promise<ConsentRecord[]>;
}
