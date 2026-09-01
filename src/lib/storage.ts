import AsyncStorage from '@react-native-async-storage/async-storage';

/** Lee y parsea JSON de AsyncStorage; devuelve `fallback` si no hay valor guardado. */
export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return fallback;
  return JSON.parse(raw) as T;
}

/** Serializa `value` a JSON y lo guarda en AsyncStorage bajo `key`. */
export async function writeJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
