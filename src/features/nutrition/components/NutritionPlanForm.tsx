import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { NumberField } from '@/components/NumberField';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { useFoods } from '@/features/foods';
import type { Food } from '@/types/food';
import type { NutritionPlanDetail, NutritionPlanInput } from '@/types/nutrition';
import { NUTRITION_CATEGORY_OPTIONS } from '../labels';
import {
  draftsFromMeals,
  draftsToInput,
  newItem,
  newMeal,
  type MealDraft,
} from '../mealDraft';
import { itemsWeightG, itemTotals, mealInputTotals } from '../nutritionMath';
import { nutritionPlanSchema, type NutritionPlanFormValues } from '../validation';
import { FoodPickerModal } from './FoodPickerModal';
import { MealEditorCard } from './MealEditorCard';
import { PlanTotalsCard } from './PlanTotalsCard';

interface NutritionPlanFormProps {
  initialValues?: NutritionPlanDetail;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (input: NutritionPlanInput) => void | Promise<void>;
  footer?: ReactNode;
}

/** Formulario compartido del plan de alimentación: metadata + constructor de comidas. */
export function NutritionPlanForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  footer,
}: NutritionPlanFormProps): React.JSX.Element {
  const foods = useFoods();
  const [meals, setMeals] = useState<MealDraft[]>(
    initialValues ? draftsFromMeals(initialValues.meals) : [],
  );
  const [pickerForMeal, setPickerForMeal] = useState<string | null>(null);
  const [expandedMealId, setExpandedMealId] = useState<string | null>(
    initialValues?.meals?.[0]?.id ?? null,
  );

  // `foods.data` es referencia estable de React Query (el wrapper de
  // `toAsyncState` no lo es), así que el `useMemo` no recomputa por render.
  const foodList = foods.status === 'ready' ? foods.data : null;
  const foodsById = useMemo(() => {
    const map = new Map<string, Food>();
    if (foodList) for (const f of foodList) map.set(f.id, f);
    return map;
  }, [foodList]);

  const { control, handleSubmit, watch } = useForm<NutritionPlanFormValues>({
    resolver: zodResolver(nutritionPlanSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      category: initialValues?.category ?? null,
      targetKcalPerDay: initialValues?.targetKcalPerDay ?? null,
      notes: initialValues?.notes ?? '',
    },
    mode: 'onTouched',
  });
  const target = watch('targetKcalPerDay');

  const totals = useMemo(
    () =>
      mealInputTotals(
        meals.flatMap((m) =>
          m.items
            .filter((i) => i.quantity !== null)
            .map((i) => ({ foodId: i.foodId, quantity: i.quantity as number })),
        ),
        foodsById,
      ),
    [meals, foodsById],
  );

  const mealKcal = (meal: MealDraft): number =>
    meal.items.reduce((n, i) => {
      const food = foodsById.get(i.foodId);
      return n + (food && i.quantity !== null ? itemTotals(i.quantity, food).kcal : 0);
    }, 0);

  const mealWeightG = (meal: MealDraft): number =>
    itemsWeightG(
      meal.items
        .filter((i) => i.quantity !== null)
        .map((i) => ({ foodId: i.foodId, quantity: i.quantity as number })),
      foodsById,
    );

  const patchMeal = (id: string, fn: (m: MealDraft) => MealDraft): void =>
    setMeals((prev) => prev.map((m) => (m.id === id ? fn(m) : m)));

  const addMeal = (): void => {
    const meal = newMeal();
    setMeals((prev) => [...prev, meal]);
    setExpandedMealId(meal.id);
  };

  const submit = handleSubmit((values) => {
    onSubmit({
      name: values.name,
      category: values.category!,
      targetKcalPerDay: values.targetKcalPerDay,
      notes: values.notes.trim() || undefined,
      meals: draftsToInput(meals),
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
          name="targetKcalPerDay"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <NumberField
              label="Objetivo kcal/día (opcional)"
              placeholder="1800"
              suffix="kcal"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <PlanTotalsCard totals={totals} target={target} />

        <View className="gap-3">
          <Text className="text-sm font-semibold text-ink">
            Comidas{meals.length > 0 ? ` · ${meals.length}` : ''}
          </Text>

          {meals.map((meal, index) => (
            <MealEditorCard
              key={meal.id}
              meal={meal}
              index={index}
              foodsById={foodsById}
              mealKcal={mealKcal(meal)}
              mealWeightG={mealWeightG(meal)}
              expanded={expandedMealId === meal.id}
              onToggle={() =>
                setExpandedMealId((current) => (current === meal.id ? null : meal.id))
              }
              onChangeName={(name) => patchMeal(meal.id, (m) => ({ ...m, name }))}
              onAddFood={() => setPickerForMeal(meal.id)}
              onChangeItemQuantity={(itemId, quantity) =>
                patchMeal(meal.id, (m) => ({
                  ...m,
                  items: m.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
                }))
              }
              onRemoveItem={(itemId) =>
                patchMeal(meal.id, (m) => ({
                  ...m,
                  items: m.items.filter((i) => i.id !== itemId),
                }))
              }
              onRemoveMeal={() => setMeals((prev) => prev.filter((m) => m.id !== meal.id))}
            />
          ))}

          <Pressable
            accessibilityRole="button"
            onPress={addMeal}
            className="flex-row items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line py-3 active:bg-surface-subtle"
          >
            <Text className="text-sm font-semibold text-primary">＋ Añadir comida</Text>
          </Pressable>

          {foodList && foodList.length === 0 ? (
            <Text className="text-xs text-ink-faint">
              El catálogo de alimentos está vacío. Créalos en el menú "Alimentos".
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View className="gap-3 border-t border-line px-5 py-3">
        <Button label={submitLabel} fullWidth loading={isSubmitting} onPress={submit} />
        {footer}
      </View>

      <FoodPickerModal
        visible={pickerForMeal !== null}
        onClose={() => setPickerForMeal(null)}
        onPick={(foodId) => {
          if (pickerForMeal) {
            patchMeal(pickerForMeal, (m) => ({ ...m, items: [...m.items, newItem(foodId)] }));
          }
          setPickerForMeal(null);
        }}
      />
    </View>
  );
}
