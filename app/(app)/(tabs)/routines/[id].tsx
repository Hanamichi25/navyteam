import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import {
  RoutineEditorForm,
  useRemoveRoutine,
  useRoutine,
  useUpdateRoutine,
} from '@/features/routines';
import { confirm } from '@/lib/confirm';
import type { RoutineInput } from '@/types/routine';

export default function EditRoutineScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const routine = useRoutine(id);
  const updateRoutine = useUpdateRoutine();
  const removeRoutine = useRemoveRoutine();

  const handleSubmit = async (input: RoutineInput) => {
    await updateRoutine.mutateAsync({ id, input });
    router.back();
  };

  const confirmDelete = (): void => {
    confirm(
      {
        title: 'Eliminar rutina',
        message: '¿Seguro que quieres eliminarla del catálogo?',
        confirmLabel: 'Eliminar',
        destructive: true,
      },
      async () => {
        await removeRoutine.mutateAsync(id);
        router.back();
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Editar Rutina" centered onBack={() => router.back()} />

      {routine.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : routine.status === 'error' ? (
        <FeedbackState variant="error" message={routine.error} />
      ) : (
        <RoutineEditorForm
          initialValues={routine.data}
          submitLabel="Guardar cambios"
          isSubmitting={updateRoutine.isPending}
          onSubmit={handleSubmit}
          footer={<Button label="Eliminar rutina" variant="outline" onPress={confirmDelete} />}
        />
      )}
    </SafeAreaView>
  );
}
