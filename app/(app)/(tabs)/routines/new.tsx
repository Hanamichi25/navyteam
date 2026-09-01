import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { RoutineEditorForm, useCreateRoutine } from '@/features/routines';
import type { RoutineInput } from '@/types/routine';

export default function NewRoutineScreen(): React.JSX.Element {
  const router = useRouter();
  const createRoutine = useCreateRoutine();

  const handleSubmit = async (input: RoutineInput) => {
    await createRoutine.mutateAsync(input);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Nueva Rutina" centered onBack={() => router.back()} />
      <RoutineEditorForm
        submitLabel="Crear rutina"
        isSubmitting={createRoutine.isPending}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
