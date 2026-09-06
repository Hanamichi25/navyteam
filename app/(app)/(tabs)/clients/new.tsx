import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import {
  ClientEditorForm,
  useAddMeasurement,
  useCreateClient,
  useInviteClient,
} from '@/features/clients';
import { todayDdMmAaaa } from '@/lib/date';
import type { ClientInput } from '@/types/client';

export default function NewClientScreen(): React.JSX.Element {
  const router = useRouter();
  const createClient = useCreateClient();
  const addMeasurement = useAddMeasurement();
  const inviteClient = useInviteClient();
  const [inviteError, setInviteError] = useState<string | null>(null);

  const handleSubmit = async (input: ClientInput, startWeightKg: number | null) => {
    setInviteError(null);
    const client = await createClient.mutateAsync(input);
    if (startWeightKg !== null) {
      await addMeasurement.mutateAsync({
        clientId: client.id,
        input: { date: todayDdMmAaaa(), weightKg: startWeightKg },
      });
    }
    // Si la ficha trae email, se envía la invitación de acceso automáticamente.
    // Si falla, la ficha ya existe: se puede reintentar desde su perfil.
    if (input.email) {
      try {
        await inviteClient.mutateAsync(client.id);
      } catch (err) {
        setInviteError(
          `Usuario creado, pero no se pudo enviar la invitación: ${
            err instanceof Error ? err.message : 'error desconocido'
          }. Reenvíala desde su perfil.`,
        );
        return;
      }
    }
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Nuevo Usuario" centered onBack={() => router.back()} />
      {inviteError ? (
        <Text className="px-5 pb-2 text-xs text-rose-600">{inviteError}</Text>
      ) : null}
      <ClientEditorForm
        submitLabel="Crear usuario"
        isSubmitting={
          createClient.isPending || addMeasurement.isPending || inviteClient.isPending
        }
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
