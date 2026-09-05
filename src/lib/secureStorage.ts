import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Storage de sesión multiplataforma.
 *
 * `expo-secure-store` no tiene implementación en web (no hay Keychain/Keystore
 * equivalente) y su fallback nativo lanza `getValueWithKeyAsync is not a
 * function` en vez de degradar solo. En web se usa `localStorage` — no es
 * cifrado, pero es el mismo nivel de protección que ya tenían los mocks de
 * AsyncStorage; en nativo (iOS/Android) sí se usa SecureStore real.
 */
export const secureStorage = {
  getItem: (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return Promise.resolve(window.localStorage.getItem(key));
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      window.localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      window.localStorage.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};
