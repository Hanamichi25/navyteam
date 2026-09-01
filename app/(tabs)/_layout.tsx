import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/features/auth/store/authStore';

/**
 * Área autenticada de la app.
 *
 * En esta fase solo contiene el Dashboard. La barra de navegación inferior del
 * mockup se renderiza como elemento visual dentro de la pantalla; las pestañas
 * reales (Usuarios, Rutinas, Alimentación, Perfil) llegan en fases posteriores.
 */
export default function TabsLayout(): React.JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
