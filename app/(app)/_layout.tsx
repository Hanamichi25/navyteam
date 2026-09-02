import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';

import { AppDrawerContent } from '@/components/AppDrawerContent';
import { useAuthStore } from '@/features/auth';

/**
 * Área del **entrenador**. Drawer (menú lateral) que envuelve las Tabs y las
 * pantallas secundarias. Redirige a Login si no hay sesión, y a la vista de
 * cliente si el usuario en sesión es un cliente.
 */
export default function AppLayout(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
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
      <Drawer.Screen name="messages" />
      <Drawer.Screen name="stats" />
      <Drawer.Screen name="settings" />
      <Drawer.Screen name="support" />
    </Drawer>
  );
}
