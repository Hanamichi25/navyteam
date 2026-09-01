import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { ExerciseForm, useCreateExercise } from '@/features/exercises';
import type { ExerciseInput } from '@/types/exercise';

export default function NewExerciseScreen(): React.JSX.Element {
  const router = useRouter();
  const createExercise = useCreateExercise();

  const handleSubmit = async (input: ExerciseInput) => {
    await createExercise.mutateAsync(input);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Nuevo Ejercicio" centered onBack={() => router.back()} />
      <ExerciseForm
        submitLabel="Crear ejercicio"
        isSubmitting={createExercise.isPending}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
