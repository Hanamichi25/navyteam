import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/features/auth';

/** Grupo de autenticación. Si ya hay sesión, salta al área según el rol. */
export default function AuthLayout(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);

  if (user) {
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

  return <Stack screenOptions={{ headerShown: false }} />;
}
