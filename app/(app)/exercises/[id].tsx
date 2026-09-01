import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import {
  ExerciseForm,
  useExercises,
  useRemoveExercise,
  useUpdateExercise,
} from '@/features/exercises';
import { confirm } from '@/lib/confirm';
import type { ExerciseInput } from '@/types/exercise';

export default function EditExerciseScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercises = useExercises();
  const updateExercise = useUpdateExercise();
  const removeExercise = useRemoveExercise();

  const exercise = exercises.status === 'ready' ? exercises.data.find((e) => e.id === id) : null;

  const handleSubmit = async (input: ExerciseInput) => {
    await updateExercise.mutateAsync({ id, input });
    router.back();
  };

  const confirmDelete = (): void => {
    confirm(
      {
        title: 'Eliminar ejercicio',
        message: '¿Seguro que quieres eliminarlo del catálogo?',
        confirmLabel: 'Eliminar',
        destructive: true,
      },
      async () => {
        await removeExercise.mutateAsync(id);
        router.back();
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Editar Ejercicio" centered onBack={() => router.back()} />

      {exercises.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : !exercise ? (
        <FeedbackState variant="error" message="No se encontró el ejercicio." />
      ) : (
        <ExerciseForm
          initialValues={exercise}
          submitLabel="Guardar cambios"
          isSubmitting={updateExercise.isPending}
          onSubmit={handleSubmit}
          footer={
            <Button label="Eliminar ejercicio" variant="outline" onPress={confirmDelete} />
          }
        />
      )}
    </SafeAreaView>
  );
}
