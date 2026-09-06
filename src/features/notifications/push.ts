import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Integración con `expo-notifications`.
 *
 * El push remoto **no funciona en web ni en Expo Go** (SDK 53+): requiere un
 * *development build* de EAS. Todo lo de aquí degrada a no-op en web y en el
 * simulador, así que la app sigue arrancando y la bandeja in-app funciona igual.
 */

const isWeb = Platform.OS === 'web';

/** Configura cómo se muestra una notificación con la app en primer plano. */
export function configurePushHandler(): void {
  if (isWeb) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

function resolveProjectId(): string | null {
  const fromExtra = Constants.expoConfig?.extra?.eas?.projectId;
  const fromEas = Constants.easConfig?.projectId;
  return (typeof fromExtra === 'string' && fromExtra) || (typeof fromEas === 'string' && fromEas) || null;
}

export interface DevicePushToken {
  token: string;
  platform: string;
}

/**
 * Pide permiso (si hace falta) y devuelve el Expo push token del dispositivo.
 * `null` si es web, un simulador, el usuario deniega, o falta el `projectId`.
 */
export async function getDevicePushToken(): Promise<DevicePushToken | null> {
  if (isWeb || !Device.isDevice) return null;

  try {
    const current = await Notifications.getPermissionsAsync();
    let granted = current.granted;
    if (!granted && current.canAskAgain) {
      granted = (await Notifications.requestPermissionsAsync()).granted;
    }
    if (!granted) return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'General',
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: '#1D74B8',
      });
    }

    const projectId = resolveProjectId();
    if (!projectId) return null;

    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return { token: data, platform: Platform.OS };
  } catch {
    return null;
  }
}

type ResponseListener = (data: Record<string, unknown>) => void;

/** Suscribe al evento "el usuario tocó una notificación". Devuelve el `remove`. */
export function addPushResponseListener(onResponse: ResponseListener): () => void {
  if (isWeb) return () => {};
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    onResponse((response.notification.request.content.data ?? {}) as Record<string, unknown>);
  });
  return () => sub.remove();
}

/** Suscribe al evento "llegó una notificación en primer plano". Devuelve el `remove`. */
export function addPushReceivedListener(onReceived: () => void): () => void {
  if (isWeb) return () => {};
  const sub = Notifications.addNotificationReceivedListener(() => onReceived());
  return () => sub.remove();
}

/** Notificación que abrió la app en frío (tap desde el sistema). */
export async function getInitialPushResponse(): Promise<Record<string, unknown> | null> {
  if (isWeb) return null;
  const response = await Notifications.getLastNotificationResponseAsync();
  if (!response) return null;
  return (response.notification.request.content.data ?? {}) as Record<string, unknown>;
}
