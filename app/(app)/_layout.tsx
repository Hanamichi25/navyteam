import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';

import { AppDrawerContent } from '@/components/AppDrawerContent';
import { useAuthStore } from '@/features/auth';

/**
 * Área autenticada. Drawer (menú lateral) que envuelve las Tabs y las pantallas
 * secundarias. Redirige a Login si no hay sesión mock activa.
 */
export default function AppLayout(): React.JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
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
      <Drawer.Screen name="messages" />
      <Drawer.Screen name="stats" />
      <Drawer.Screen name="settings" />
      <Drawer.Screen name="support" />
    </Drawer>
  );
}
