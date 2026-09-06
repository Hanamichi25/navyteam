import { create } from 'zustand';

import type { AuthGateway } from '../gateway';
import type { AuthStatus, Consent, ConsentRecord, LoginCredentials, User } from '@/types/auth';
import { isLoginSuccess } from '@/types/auth';

/** Inactividad máxima antes de cerrar sesión automáticamente (web y nativo). */
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Estado de sesión, respaldado por `AuthGateway` (inyectado desde
 * `app/_layout.tsx` vía `configureAuthGateway`, ver `AuthGatewayProvider`).
 *
 * `restoring` cubre el arranque de la app: hay un intento de recuperar la
 * sesión persistida (`expo-secure-store`) antes de decidir si mostrar el
 * login o el área correspondiente. Los guards de navegación deben esperar a
 * `restoring === false` antes de redirigir por falta de `user`.
 */
interface AuthState {
  user: User | null;
  status: AuthStatus;
  /** `true` mientras se intenta recuperar la sesión persistida al arrancar. */
  restoring: boolean;
  /** Mensaje de error legible para la UI, o `null` si no hay error. */
  error: string | null;
  isAuthenticated: boolean;
  /** Consentimiento de política de datos del usuario actual, o `null`. */
  consent: Consent | null;
  /** `false` hasta que se resuelve la primera consulta de consentimiento tras autenticar. */
  consentReady: boolean;

  /** Recupera la sesión persistida (llamar una vez, al montar la app). */
  restore: () => Promise<void>;
  /**
   * Intenta autenticar al usuario.
   * @returns `true` si el login fue exitoso.
   */
  login: (credentials: LoginCredentials) => Promise<boolean>;
  /** Cierre iniciado por el usuario: revoca en el servidor + limpia el estado. */
  logout: () => Promise<void>;
  /**
   * Cierre por causa externa (token caducado/revocado, logout en otra pestaña,
   * timeout por inactividad): solo limpia el estado local — el servidor ya
   * invalidó la sesión (o lo hará el propio supabase-js).
   */
  endSession: () => void;
  /** Vuelve a leer el consentimiento del usuario actual (ej: tras `set-password`). */
  refreshConsent: () => Promise<void>;
  /** Registra la aceptación de `policyVersion` para el usuario actual. */
  acceptConsent: (policyVersion: string) => Promise<void>;
  /** Trae el registro auditable de aceptaciones (para exportar desde Configuración). */
  fetchConsentReport: () => Promise<ConsentRecord[]>;
  /** Limpia el error actual (ej: cuando el usuario vuelve a editar el formulario). */
  clearError: () => void;
}

let gateway: AuthGateway | null = null;

/** Inyecta la implementación de `AuthGateway` que usará el store. Llamar una sola vez, en `app/_layout.tsx`. */
export function configureAuthGateway(impl: AuthGateway): void {
  gateway = impl;
}

function getGateway(): AuthGateway {
  if (!gateway) {
    throw new Error('configureAuthGateway() no fue llamado antes de usar useAuthStore.');
  }
  return gateway;
}

/** Lee el consentimiento del usuario autenticado, tolerando fallos de red. */
async function loadConsent(): Promise<Consent | null> {
  try {
    return await getGateway().getConsent();
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',
  restoring: true,
  error: null,
  isAuthenticated: false,
  consent: null,
  consentReady: false,

  restore: async () => {
    try {
      const session = await getGateway().getSession();
      if (session) {
        const consent = await loadConsent();
        set({
          user: session.user,
          isAuthenticated: true,
          status: 'success',
          consent,
          consentReady: true,
        });
      }
    } finally {
      set({ restoring: false });
    }
  },

  login: async (credentials) => {
    set({ status: 'loading', error: null });

    const result = await getGateway().signIn(credentials);

    if (isLoginSuccess(result)) {
      set({ consentReady: false });
      const consent = await loadConsent();
      set({
        user: result.user,
        isAuthenticated: true,
        status: 'success',
        error: null,
        consent,
        consentReady: true,
      });
      return true;
    }

    set({
      user: null,
      isAuthenticated: false,
      status: 'error',
      error: result.error,
    });
    return false;
  },

  logout: async () => {
    try {
      await getGateway().signOut();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        status: 'idle',
        error: null,
        consent: null,
        consentReady: false,
      });
    }
  },

  endSession: () => {
    if (!get().user) return;
    set({
      user: null,
      isAuthenticated: false,
      status: 'idle',
      error: null,
      consent: null,
      consentReady: false,
    });
  },

  refreshConsent: async () => {
    if (!get().user) return;
    set({ consent: await loadConsent(), consentReady: true });
  },

  acceptConsent: async (policyVersion) => {
    await getGateway().acceptConsent(policyVersion);
    set({ consent: { policyVersion, acceptedAt: new Date().toISOString() } });
  },

  fetchConsentReport: () => getGateway().getConsentReport(),

  clearError: () => set((state) => (state.error ? { error: null, status: 'idle' } : state)),
}));

/**
 * Conecta el fin de sesión externo (caducidad, revocación remota, logout en
 * otra pestaña) con la limpieza del store. Llamar una vez, al montar la app
 * (`SessionGuard`). Devuelve la función para cancelar la suscripción.
 */
export function subscribeAuthGatewayEvents(): () => void {
  return getGateway().onSessionEnd(() => {
    useAuthStore.getState().endSession();
  });
}
