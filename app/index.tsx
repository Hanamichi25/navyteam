import { Redirect } from 'expo-router';

import { useAuthStore } from '@/features/auth/store/authStore';

/** Punto de entrada: envía al dashboard si hay sesión mock activa, si no al login. */
export default function Index(): React.JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Redirect href={isAuthenticated ? '/(tabs)/dashboard' : '/(auth)/login'} />
  );
}
