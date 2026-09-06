import { Text, View } from 'react-native';

import { MacroBar } from '@/components/MacroBar';
import type { NutritionTotals } from '@/types/nutrition';

interface PlanTotalsCardProps {
  totals: NutritionTotals;
  /** Objetivo diario del entrenador, si lo puso. */
  target: number | null;
}

/** Resumen calculado del plan: kcal + gramos de macros + comparación con el objetivo. */
export function PlanTotalsCard({ totals, target }: PlanTotalsCardProps): React.JSX.Element {
  const diff = target !== null ? totals.kcal - target : null;

  return (
    <View className="gap-3 rounded-2xl bg-primary-light p-4">
      <View className="flex-row items-end justify-between">
        <View>
          <Text className="text-2xl font-extrabold text-primary-dark">
            {totals.kcal.toLocaleString('es-ES')} kcal
          </Text>
          <Text className="text-xs text-ink-muted">total del plan</Text>
        </View>
        {target !== null ? (
          <View className="items-end">
            <Text className="text-sm font-semibold text-ink">
              Objetivo {target.toLocaleString('es-ES')}
            </Text>
            {diff !== null ? (
              <Text
                className={`text-xs font-semibold ${
                  Math.abs(diff) <= 75
                    ? 'text-emerald-700'
                    : diff > 0
                      ? 'text-amber-600'
                      : 'text-sky-600'
                }`}
              >
                {diff === 0 ? 'en el objetivo' : `${diff > 0 ? '+' : ''}${diff} kcal`}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <View className="flex-row justify-between">
        <Text className="text-xs font-semibold text-ink-muted">
          P {totals.grams.proteinG} g
        </Text>
        <Text className="text-xs font-semibold text-ink-muted">C {totals.grams.carbsG} g</Text>
        <Text className="text-xs font-semibold text-ink-muted">G {totals.grams.fatG} g</Text>
      </View>
      <MacroBar macros={totals.macros} />
    </View>
  );
}
