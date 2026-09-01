import { Redirect } from 'expo-router';

import { useAuthStore } from '@/features/auth';

/** Punto de entrada: envía a la app si hay sesión mock activa, si no al login. */
export default function Index(): React.JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Redirect
      href={isAuthenticated ? '/(app)/(tabs)/dashboard' : '/(auth)/login'}
    />
  );
}
