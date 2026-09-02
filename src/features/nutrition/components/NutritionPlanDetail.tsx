import { Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { formatMacros, MacroBar } from '@/components/MacroBar';
import type { NutritionPlan } from '@/types/nutrition';

import { NUTRITION_CATEGORY_LABEL, NUTRITION_CATEGORY_TONE } from '../labels';

interface NutritionPlanDetailProps {
  plan: NutritionPlan;
}

/** Vista de solo lectura de un plan de alimentación (objetivo + macros + notas). */
export function NutritionPlanDetail({
  plan,
}: NutritionPlanDetailProps): React.JSX.Element {
  return (
    <View className="gap-4">
      <View className="gap-1.5">
        <Badge
          label={NUTRITION_CATEGORY_LABEL[plan.category]}
          tone={NUTRITION_CATEGORY_TONE[plan.category]}
        />
        <Text className="text-lg font-bold text-ink">{plan.name}</Text>
        <Text className="text-base font-semibold text-primary">
          {plan.kcalPerDay} kcal/día
        </Text>
      </View>

      <View className="gap-2 rounded-2xl border border-line bg-surface-subtle p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-ink-muted">Macros (P / C / G)</Text>
          <Text className="text-sm font-semibold text-ink-muted">
            {formatMacros(plan.macros)}
          </Text>
        </View>
        <MacroBar macros={plan.macros} />
      </View>

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
