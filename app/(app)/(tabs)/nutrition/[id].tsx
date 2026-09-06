import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import {
  NutritionPlanForm,
  useNutritionPlan,
  useRemoveNutritionPlan,
  useUpdateNutritionPlan,
} from '@/features/nutrition';
import { confirm } from '@/lib/confirm';
import type { NutritionPlanInput } from '@/types/nutrition';

export default function EditNutritionPlanScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const plan = useNutritionPlan(id);
  const updatePlan = useUpdateNutritionPlan();
  const removePlan = useRemoveNutritionPlan();

  const handleSubmit = async (input: NutritionPlanInput) => {
    await updatePlan.mutateAsync({ id, input });
    router.back();
  };

  const confirmDelete = (): void => {
    confirm(
      {
        title: 'Eliminar plan',
        message: '¿Seguro que quieres eliminarlo del catálogo?',
        confirmLabel: 'Eliminar',
        destructive: true,
      },
      async () => {
        await removePlan.mutateAsync(id);
        router.back();
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Editar Plan" centered onBack={() => router.back()} />

      {plan.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : plan.status === 'error' ? (
        <FeedbackState variant="error" message={plan.error} />
      ) : (
        <NutritionPlanForm
          initialValues={plan.data}
          submitLabel="Guardar cambios"
          isSubmitting={updatePlan.isPending}
          onSubmit={handleSubmit}
          footer={<Button label="Eliminar plan" variant="outline" onPress={confirmDelete} />}
        />
      )}
    </SafeAreaView>
  );
}
