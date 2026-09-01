import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { NumberField } from '@/components/NumberField';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import type { NutritionPlanInput } from '@/types/nutrition';
import { NUTRITION_CATEGORY_OPTIONS } from '../labels';
import { nutritionPlanSchema, type NutritionPlanFormValues } from '../validation';

interface NutritionPlanFormProps {
  initialValues?: NutritionPlanInput;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (input: NutritionPlanInput) => void | Promise<void>;
  /** Contenido extra bajo el botón principal, ej: eliminar en modo edición. */
  footer?: ReactNode;
}

/** Formulario compartido de plan de alimentación, usado en modo crear y editar. */
export function NutritionPlanForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  footer,
}: NutritionPlanFormProps): React.JSX.Element {
  const { control, handleSubmit } = useForm<NutritionPlanFormValues>({
    resolver: zodResolver(nutritionPlanSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      category: initialValues?.category ?? null,
      kcalPerDay: initialValues?.kcalPerDay ?? null,
      proteinPct: initialValues?.macros.proteinPct ?? null,
      carbsPct: initialValues?.macros.carbsPct ?? null,
      fatPct: initialValues?.macros.fatPct ?? null,
      notes: initialValues?.notes ?? '',
    },
    mode: 'onTouched',
  });

  const submit = handleSubmit((values) => {
    onSubmit({
      name: values.name,
      category: values.category!,
      kcalPerDay: values.kcalPerDay!,
      macros: {
        proteinPct: values.proteinPct!,
        carbsPct: values.carbsPct!,
        fatPct: values.fatPct!,
      },
      notes: values.notes.trim() || undefined,
    });
  });

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pt-2 pb-6"
        showsVerticalScrollIndicator={false}
      >
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

        <Controller
          control={control}
          name="notes"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <TextField
              label="Notas (opcional)"
              placeholder="Indicaciones, sustituciones, horarios de comida..."
              multiline
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
      </ScrollView>

      <View className="gap-3 border-t border-line px-5 py-3">
        <Button label={submitLabel} fullWidth loading={isSubmitting} onPress={submit} />
        {footer}
      </View>
    </View>
  );
}
