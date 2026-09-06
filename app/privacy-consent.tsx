import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { PrivacyPolicyView, PRIVACY_POLICY_VERSION, useAuthStore, useConsent } from '@/features/auth';
import { confirm } from '@/lib/confirm';

/**
 * Gate de aceptación de la Política de Tratamiento de Datos. Se llega aquí
 * cuando hay sesión pero falta aceptar la versión vigente. Sin aceptar no se
 * entra a la app; "No acepto" cierra la sesión.
 */
export default function PrivacyConsentScreen(): React.JSX.Element {
  const router = useRouter();
  const { loading, needsConsent } = useConsent();
  const acceptConsent = useAuthStore((s) => s.acceptConsent);
  const logout = useAuthStore((s) => s.logout);
  const [busy, setBusy] = useState(false);

  if (!loading && !needsConsent) {
    return <Redirect href="/" />;
  }

  const accept = async (): Promise<void> => {
    setBusy(true);
    try {
      await acceptConsent(PRIVACY_POLICY_VERSION);
      router.replace('/');
    } finally {
      setBusy(false);
    }
  };

  const decline = (): void => {
    confirm(
      {
        title: 'No aceptar la política',
        message:
          'Sin aceptar la Política de Tratamiento de Datos no puedes usar la app. Se cerrará tu sesión.',
        confirmLabel: 'Cerrar sesión',
        destructive: true,
      },
      async () => {
        await logout();
        router.replace('/(auth)/login');
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <View className="border-b border-line px-5 py-4">
        <Text className="text-lg font-extrabold text-ink">Antes de continuar</Text>
        <Text className="mt-1 text-sm text-ink-muted">
          Para usar NavyTeam necesitas leer y aceptar cómo tratamos tus datos personales.
        </Text>
      </View>

      <PrivacyPolicyView />

      <View className="gap-3 border-t border-line px-5 py-3">
        <Button label="Acepto la política" fullWidth loading={busy} onPress={accept} />
        <Button label="No acepto" variant="outline" fullWidth onPress={decline} />
      </View>
    </SafeAreaView>
  );
}
