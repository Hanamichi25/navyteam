import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { NutritionPlanForm, useCreateNutritionPlan } from '@/features/nutrition';
import type { NutritionPlanInput } from '@/types/nutrition';

export default function NewNutritionPlanScreen(): React.JSX.Element {
  const router = useRouter();
  const createPlan = useCreateNutritionPlan();

  const handleSubmit = async (input: NutritionPlanInput) => {
    await createPlan.mutateAsync(input);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Nuevo Plan" centered onBack={() => router.back()} />
      <NutritionPlanForm
        submitLabel="Crear plan"
        isSubmitting={createPlan.isPending}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
