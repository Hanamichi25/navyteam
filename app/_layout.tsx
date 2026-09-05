import '../global.css';

import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { configureAuthGateway, useAuthStore } from '@/features/auth';
import { createMockAuthGateway } from '@/features/auth/mocks/authGateway.mock';
import { createSupabaseAuthGateway } from '@/features/auth/supabase/authGateway.supabase';
import { GatewaysProvider } from '@/gateways';

const queryClient = new QueryClient();

// TODO(backend): quitar la rama mock cuando ya no haga falta desarrollar/testear sin credenciales.
configureAuthGateway(
  process.env.EXPO_PUBLIC_SUPABASE_URL ? createSupabaseAuthGateway() : createMockAuthGateway(),
);

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout(): React.JSX.Element | null {
  const [fontsLoaded] = useFonts({
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const restore = useAuthStore((state) => state.restore);
  const restoring = useAuthStore((state) => state.restoring);
  const [restoreStarted, setRestoreStarted] = useState(false);

  useEffect(() => {
    if (!restoreStarted) {
      setRestoreStarted(true);
      restore();
    }
  }, [restoreStarted, restore]);

  useEffect(() => {
    if (fontsLoaded && !restoring) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, restoring]);

  if (!fontsLoaded || restoring) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <GatewaysProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
              <Stack.Screen name="(client)" />
            </Stack>
          </GatewaysProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
