import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ClientEditorForm, useClient, useRemoveClient, useUpdateClient } from '@/features/clients';
import { confirm } from '@/lib/confirm';
import type { ClientInput } from '@/types/client';

export default function EditClientScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const client = useClient(id);
  const updateClient = useUpdateClient();
  const removeClient = useRemoveClient();

  const handleSubmit = async (input: ClientInput) => {
    await updateClient.mutateAsync({ id, input });
    router.back();
  };

  const confirmDelete = (): void => {
    confirm(
      {
        title: 'Eliminar usuario',
        message: '¿Seguro que quieres eliminarlo? Se perderá su historial de mediciones.',
        confirmLabel: 'Eliminar',
        destructive: true,
      },
      async () => {
        await removeClient.mutateAsync(id);
        router.replace('/(app)/(tabs)/clients');
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Editar Usuario" centered onBack={() => router.back()} />

      {client.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : client.status === 'error' ? (
        <FeedbackState variant="error" message={client.error} />
      ) : (
        <ClientEditorForm
          initialValues={client.data}
          submitLabel="Guardar cambios"
          isSubmitting={updateClient.isPending}
          onSubmit={handleSubmit}
          footer={<Button label="Eliminar usuario" variant="outline" onPress={confirmDelete} />}
        />
      )}
    </SafeAreaView>
  );
}
