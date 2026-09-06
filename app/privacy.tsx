import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrivacyPolicyView } from '@/features/auth';
import { ScreenHeader } from '@/components/ScreenHeader';

/** Política de Tratamiento de Datos — solo lectura. Enlazada desde login y Cuenta/Perfil. */
export default function PrivacyScreen(): React.JSX.Element {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Privacidad"
        centered
        onBack={router.canGoBack() ? () => router.back() : undefined}
      />
      <PrivacyPolicyView />
    </SafeAreaView>
  );
}
