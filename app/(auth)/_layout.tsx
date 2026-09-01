import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/features/auth';

/** Grupo de autenticación. Si ya hay sesión, se salta el login. */
export default function AuthLayout(): React.JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)/dashboard" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
