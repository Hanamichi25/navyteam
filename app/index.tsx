import { Redirect } from 'expo-router';

import { useAuthStore, useConsent } from '@/features/auth';

/** Punto de entrada: enruta según la sesión, el consentimiento y el rol del usuario. */
export default function Index(): React.JSX.Element | null {
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

  return (
    <Redirect
      href={user.role === 'client' ? '/(client)/routine' : '/(app)/(tabs)/dashboard'}
    />
  );
}
