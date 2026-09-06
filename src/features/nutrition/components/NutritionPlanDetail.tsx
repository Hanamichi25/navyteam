import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { MacroBar } from '@/components/MacroBar';
import { FOOD_UNIT_SUFFIX } from '@/features/foods';
import { COLORS } from '@/lib/colors';
import type { NutritionPlanDetail as NutritionPlanDetailType } from '@/types/nutrition';

import { NUTRITION_CATEGORY_LABEL, NUTRITION_CATEGORY_TONE } from '../labels';

interface NutritionPlanDetailProps {
  plan: NutritionPlanDetailType;
}

function quantityLabel(quantity: number, unit: string): string {
  return `${quantity} ${FOOD_UNIT_SUFFIX[unit as keyof typeof FOOD_UNIT_SUFFIX] ?? unit}`;
}

/** Vista de solo lectura de un plan de alimentación: total + comidas + notas. */
export function NutritionPlanDetail({ plan }: NutritionPlanDetailProps): React.JSX.Element {
  const { totals, targetKcalPerDay, meals } = plan;
  const diff = targetKcalPerDay !== null ? totals.kcal - targetKcalPerDay : null;

  return (
    <View className="gap-4">
      <View className="gap-1.5">
        <Badge
          label={NUTRITION_CATEGORY_LABEL[plan.category]}
          tone={NUTRITION_CATEGORY_TONE[plan.category]}
        />
        <Text className="text-xl font-extrabold text-ink">{plan.name}</Text>
      </View>

      <View className="flex-row items-center gap-3 rounded-xl bg-primary-light p-4">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-surface">
          <Ionicons name="flame-outline" size={22} color={COLORS.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-2xl font-extrabold text-primary-dark">
            {totals.kcal.toLocaleString('es-ES')} kcal
          </Text>
          <Text className="text-sm text-ink-muted">
            {meals.length > 0 ? 'total del plan' : 'objetivo diario'}
            {targetKcalPerDay !== null && meals.length > 0
              ? ` · objetivo ${targetKcalPerDay.toLocaleString('es-ES')}${
                  diff !== null && diff !== 0 ? ` (${diff > 0 ? '+' : ''}${diff})` : ''
                }`
              : ''}
          </Text>
        </View>
      </View>

      <View className="gap-2.5">
        <View className="flex-row justify-between">
          <Text className="text-sm font-semibold text-ink">Proteína {totals.grams.proteinG} g</Text>
          <Text className="text-sm font-semibold text-ink">Carbos {totals.grams.carbsG} g</Text>
          <Text className="text-sm font-semibold text-ink">Grasas {totals.grams.fatG} g</Text>
        </View>
        <MacroBar macros={totals.macros} />
      </View>

      {meals.length > 0 ? (
        <View className="gap-3">
          <Text className="text-sm font-bold text-ink">Comidas</Text>
          {meals.map((meal) => (
            <CollapsibleSection
              key={meal.id}
              title={meal.name}
              iconName="restaurant-outline"
              summary={`${meal.kcal} kcal`}
            >
              <View className="gap-2">
                {meal.items.map((item) => (
                  <View
                    key={item.id}
                    className="flex-row items-center justify-between rounded-lg bg-surface-subtle px-3 py-2"
                  >
                    <Text className="flex-1 text-sm text-ink" numberOfLines={1}>
                      {item.foodName}
                    </Text>
                    <Text className="text-xs text-ink-faint">
                      {quantityLabel(item.quantity, item.unit)} · {item.kcal} kcal
                    </Text>
                  </View>
                ))}
              </View>
            </CollapsibleSection>
          ))}
        </View>
      ) : null}

      {plan.notes ? (
        <View className="gap-1.5 rounded-2xl border border-line bg-surface-subtle p-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Notas de tu entrenador
          </Text>
          <Text className="text-sm leading-5 text-ink">{plan.notes}</Text>
        </View>
      ) : null}
    </View>
  );
}
