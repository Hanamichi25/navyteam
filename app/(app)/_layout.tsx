import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';

import { AppDrawerContent } from '@/components/AppDrawerContent';
import { useAuthStore, useConsent } from '@/features/auth';

/**
 * Área del **entrenador**. Drawer (menú lateral) que envuelve las Tabs y las
 * pantallas secundarias. Redirige a Login si no hay sesión, y a la vista de
 * cliente si el usuario en sesión es un cliente.
 */
export default function AppLayout(): React.JSX.Element | null {
  const user = useAuthStore((state) => state.user);
  const consent = useConsent();

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (consent.loading) {
    return null;
  }

  if (consent.needsConsent) {
    return <Redirect href="/privacy-consent" />;
  }

  if (user.role === 'client') {
    return <Redirect href="/(client)/routine" />;
  }

  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        swipeEdgeWidth: 60,
        drawerStyle: { width: 300 },
      }}
    >
      <Drawer.Screen name="(tabs)" />
      <Drawer.Screen name="foods" />
      <Drawer.Screen name="messages" />
      <Drawer.Screen name="notifications" />
      <Drawer.Screen name="stats" />
      <Drawer.Screen name="settings" />
      <Drawer.Screen name="support" />
    </Drawer>
  );
}
