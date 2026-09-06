import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { FoodEditorForm, useCreateFood } from '@/features/foods';
import type { FoodInput } from '@/types/food';

export default function NewFoodScreen(): React.JSX.Element {
  const router = useRouter();
  const createFood = useCreateFood();

  const handleSubmit = async (input: FoodInput) => {
    await createFood.mutateAsync(input);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Nuevo Alimento" centered onBack={() => router.back()} />
      <FoodEditorForm
        submitLabel="Crear alimento"
        isSubmitting={createFood.isPending}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
