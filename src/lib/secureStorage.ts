import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Storage de sesión multiplataforma.
 *
 * - **Nativo (iOS/Android):** `expo-secure-store` (Keychain / Keystore).
 * - **Web:** `sessionStorage` — el token de Supabase (`sb-<ref>-auth-token`,
 *   access + refresh) vive solo mientras la pestaña está abierta y **no se
 *   escribe a disco**. Al cerrar el navegador se pierde y hay que volver a
 *   entrar (decisión de seguridad: datos de salud, Ley 1581/2012). Si el
 *   re-login por pestaña molesta, cambiar a `localStorage` aquí.
 *
 * `expo-secure-store` no tiene implementación en web y su fallback nativo lanza
 * en vez de degradar, por eso la rama explícita por `Platform.OS`.
 */

function webStore(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null;
  } catch {
    return null; // modo incógnito / cookies bloqueadas
  }
}

export const secureStorage = {
  getItem: (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        return Promise.resolve(webStore()?.getItem(key) ?? null);
      } catch {
        return Promise.resolve(null);
      }
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        webStore()?.setItem(key, value);
      } catch {
        /* storage no disponible */
      }
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        webStore()?.removeItem(key);
      } catch {
        /* storage no disponible */
      }
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};
