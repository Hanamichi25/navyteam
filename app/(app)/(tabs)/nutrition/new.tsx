import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { NumberField } from '@/components/NumberField';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { NUTRITION_CATEGORY_OPTIONS, useCreateNutritionPlan } from '@/features/nutrition';
import { nutritionPlanSchema, type NutritionPlanFormValues } from '@/features/nutrition/validation';

/**
 * Formulario "Nuevo plan de alimentación".
 * Plantilla de referencia para los editores de las Fases 4-6: Gateway
 * inyectado vía hook de mutación + campos reutilizables + Zod.
 */
export default function NewNutritionPlanScreen(): React.JSX.Element {
  const router = useRouter();
  const createPlan = useCreateNutritionPlan();

  const { control, handleSubmit, formState } = useForm<NutritionPlanFormValues>({
    resolver: zodResolver(nutritionPlanSchema),
    defaultValues: {
      name: '',
      category: null,
      kcalPerDay: null,
      proteinPct: null,
      carbsPct: null,
      fatPct: null,
    },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    await createPlan.mutateAsync({
      name: values.name,
      category: values.category!,
      kcalPerDay: values.kcalPerDay!,
      macros: {
        proteinPct: values.proteinPct!,
        carbsPct: values.carbsPct!,
        fatPct: values.fatPct!,
      },
    });
    router.back();
  });

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScreenHeader title="Nuevo Plan" centered onBack={() => router.back()} />

      <View className="flex-1 gap-5 px-5 pt-2">
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <TextField
              label="Nombre"
              placeholder="Plan Déficit Calórico"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="category"
          render={({ field: { value, onChange }, fieldState }) => (
            <SelectField
              label="Categoría"
              options={NUTRITION_CATEGORY_OPTIONS}
              value={value}
              onChange={onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="kcalPerDay"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <NumberField
              label="Kcal / día"
              placeholder="2000"
              suffix="kcal"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="proteinPct"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <NumberField
                  label="Proteína"
                  suffix="%"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="carbsPct"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <NumberField
                  label="Carbos"
                  suffix="%"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="fatPct"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <NumberField
                  label="Grasas"
                  suffix="%"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>
        </View>
      </View>

      <View className="border-t border-line px-5 py-3">
        <Button
          label="Crear plan"
          fullWidth
          loading={createPlan.isPending}
          disabled={formState.isSubmitting}
          onPress={onSubmit}
        />
      </View>
    </SafeAreaView>
  );
}
