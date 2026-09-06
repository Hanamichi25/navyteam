import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { NumberField } from '@/components/NumberField';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import type { FoodInput, FoodUnit } from '@/types/food';
import { FOOD_REF_QUANTITY, FOOD_UNIT_OPTIONS, refQuantityLabel } from '../labels';
import { foodSchema, type FoodFormValues } from '../validation';

interface FoodEditorFormProps {
  initialValues?: FoodInput;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (input: FoodInput) => void | Promise<void>;
  footer?: ReactNode;
}

/** Formulario compartido de alimento (crear / editar). */
export function FoodEditorForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  footer,
}: FoodEditorFormProps): React.JSX.Element {
  const { control, handleSubmit } = useForm<FoodFormValues>({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      unit: initialValues?.unit ?? null,
      kcal: initialValues?.kcal ?? null,
      proteinG: initialValues?.proteinG ?? null,
      carbsG: initialValues?.carbsG ?? null,
      fatG: initialValues?.fatG ?? null,
    },
    mode: 'onTouched',
  });

  const unit = useWatch({ control, name: 'unit' });
  const perLabel = unit ? refQuantityLabel(unit, FOOD_REF_QUANTITY[unit]) : 'por porción';

  const submit = handleSubmit((values) => {
    const u = values.unit as FoodUnit;
    onSubmit({
      name: values.name.trim(),
      unit: u,
      refQuantity: FOOD_REF_QUANTITY[u],
      kcal: values.kcal!,
      proteinG: values.proteinG!,
      carbsG: values.carbsG!,
      fatG: values.fatG!,
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
              placeholder="Avena, huevo, pechuga de pollo..."
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="unit"
          render={({ field: { value, onChange }, fieldState }) => (
            <SelectField
              label="Se mide en"
              options={FOOD_UNIT_OPTIONS}
              value={value}
              onChange={onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Text className="-mb-2 text-xs text-ink-faint">
          Valores nutricionales {perLabel}:
        </Text>

        <Controller
          control={control}
          name="kcal"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <NumberField
              label="Calorías"
              suffix="kcal"
              decimal
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
              name="proteinG"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <NumberField
                  label="Proteína"
                  suffix="g"
                  decimal
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
              name="carbsG"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <NumberField
                  label="Carbos"
                  suffix="g"
                  decimal
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
              name="fatG"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <NumberField
                  label="Grasas"
                  suffix="g"
                  decimal
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>
        </View>
      </ScrollView>

      <View className="gap-3 border-t border-line px-5 py-3">
        <Button label={submitLabel} fullWidth loading={isSubmitting} onPress={submit} />
        {footer}
      </View>
    </View>
  );
}
