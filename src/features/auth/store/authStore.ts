import { create } from 'zustand';

import type { AuthStatus, LoginCredentials, User } from '@/types/auth';
import { isLoginSuccess } from '@/types/auth';
import { mockLogin, mockLogout } from '../mocks/authService.mock';

/**
 * Estado de sesión (mock, en memoria).
 *
 * Fase actual: no se persiste entre reinicios de la app. La siguiente fase
 * moverá el token a `expo-secure-store` y rehidratará la sesión al arrancar.
 */
interface AuthState {
  user: User | null;
  status: AuthStatus;
  /** Mensaje de error legible para la UI, o `null` si no hay error. */
  error: string | null;
  isAuthenticated: boolean;

  /**
   * Intenta autenticar al usuario.
   * @returns `true` si el login fue exitoso.
   */
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  /** Limpia el error actual (ej: cuando el usuario vuelve a editar el formulario). */
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  error: null,
  isAuthenticated: false,

  login: async (credentials) => {
    set({ status: 'loading', error: null });

    // TODO(backend): esta llamada apuntará al servicio de auth real.
    const result = await mockLogin(credentials);

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
    // TODO(backend): revocar refresh token y limpiar secure-store.
    await mockLogout();
    set({
      user: null,
      isAuthenticated: false,
      status: 'idle',
      error: null,
    });
  },

  clearError: () => set((state) => (state.error ? { error: null, status: 'idle' } : state)),
}));
