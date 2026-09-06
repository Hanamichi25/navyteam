import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/features/auth';

/** Grupo de autenticación. Si ya hay sesión, delega en `index` (consentimiento + rol). */
export default function AuthLayout(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);

  if (user) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
