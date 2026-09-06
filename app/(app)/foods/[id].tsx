import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FeedbackState } from '@/components/FeedbackState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FoodEditorForm, useFoods, useRemoveFood, useUpdateFood } from '@/features/foods';
import { confirm } from '@/lib/confirm';
import type { FoodInput } from '@/types/food';

export default function EditFoodScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const foods = useFoods();
  const updateFood = useUpdateFood();
  const removeFood = useRemoveFood();

  const food = foods.status === 'ready' ? foods.data.find((f) => f.id === id) : null;

  const handleSubmit = async (input: FoodInput) => {
    await updateFood.mutateAsync({ id, input });
    router.back();
  };

  const confirmDelete = (): void => {
    confirm(
      {
        title: 'Eliminar alimento',
        message:
          '¿Seguro que quieres eliminarlo del catálogo? No se puede si está usado en algún plan.',
        confirmLabel: 'Eliminar',
        destructive: true,
      },
      async () => {
        await removeFood.mutateAsync(id);
        router.back();
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Editar Alimento" centered onBack={() => router.back()} />

      {foods.status === 'loading' ? (
        <FeedbackState variant="loading" />
      ) : !food ? (
        <FeedbackState variant="error" message="No se encontró el alimento." />
      ) : (
        <FoodEditorForm
          initialValues={food}
          submitLabel="Guardar cambios"
          isSubmitting={updateFood.isPending}
          onSubmit={handleSubmit}
          footer={<Button label="Eliminar alimento" variant="outline" onPress={confirmDelete} />}
        />
      )}
    </SafeAreaView>
  );
}
