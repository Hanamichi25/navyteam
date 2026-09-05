import { create } from 'zustand';

import type { AuthGateway } from '../gateway';
import type { AuthStatus, LoginCredentials, User } from '@/types/auth';
import { isLoginSuccess } from '@/types/auth';

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

  /** Recupera la sesión persistida (llamar una vez, al montar la app). */
  restore: () => Promise<void>;
  /**
   * Intenta autenticar al usuario.
   * @returns `true` si el login fue exitoso.
   */
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  restoring: true,
  error: null,
  isAuthenticated: false,

  restore: async () => {
    try {
      const session = await getGateway().getSession();
      if (session) {
        set({ user: session.user, isAuthenticated: true, status: 'success' });
      }
    } finally {
      set({ restoring: false });
    }
  },

  login: async (credentials) => {
    set({ status: 'loading', error: null });

    const result = await getGateway().signIn(credentials);

    if (isLoginSuccess(result)) {
      set({
        user: result.user,
        isAuthenticated: true,
        status: 'success',
        error: null,
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
    await getGateway().signOut();
    set({
      user: null,
      isAuthenticated: false,
      status: 'idle',
      error: null,
    });
  },

  clearError: () => set((state) => (state.error ? { error: null, status: 'idle' } : state)),
}));
