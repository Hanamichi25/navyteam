import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { SessionLoggerForm } from '@/features/workouts';

export default function LogSessionScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Registrar Sesión" centered onBack={() => router.back()} />
      <SessionLoggerForm clientId={id} onDone={() => router.back()} />
    </SafeAreaView>
  );
}
