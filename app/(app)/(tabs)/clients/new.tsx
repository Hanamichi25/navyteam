import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { ClientEditorForm, useAddMeasurement, useCreateClient } from '@/features/clients';
import { todayDdMmAaaa } from '@/lib/date';
import type { ClientInput } from '@/types/client';

export default function NewClientScreen(): React.JSX.Element {
  const router = useRouter();
  const createClient = useCreateClient();
  const addMeasurement = useAddMeasurement();

  const handleSubmit = async (input: ClientInput, startWeightKg: number | null) => {
    const client = await createClient.mutateAsync(input);
    if (startWeightKg !== null) {
      await addMeasurement.mutateAsync({
        clientId: client.id,
        input: { date: todayDdMmAaaa(), weightKg: startWeightKg },
      });
    }
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Nuevo Usuario" centered onBack={() => router.back()} />
      <ClientEditorForm
        submitLabel="Crear usuario"
        isSubmitting={createClient.isPending || addMeasurement.isPending}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
