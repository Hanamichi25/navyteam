import { Redirect } from 'expo-router';

import { useAuthStore } from '@/features/auth';

/** Punto de entrada: enruta según la sesión mock y el rol del usuario. */
export default function Index(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Redirect
      href={
        user.role === 'client'
          ? '/(client)/routine'
          : '/(app)/(tabs)/dashboard'
      }
    />
  );
}
