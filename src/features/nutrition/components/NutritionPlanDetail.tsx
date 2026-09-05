import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { MacroBar } from '@/components/MacroBar';
import { COLORS } from '@/lib/colors';
import type { NutritionPlan } from '@/types/nutrition';

import { NUTRITION_CATEGORY_LABEL, NUTRITION_CATEGORY_TONE } from '../labels';

interface NutritionPlanDetailProps {
  plan: NutritionPlan;
}

/** Gramos de un macro a partir de las kcal diarias y su porcentaje. */
function macroGrams(kcalPerDay: number, pct: number, kcalPerGram: number): number {
  return Math.round((kcalPerDay * pct) / 100 / kcalPerGram);
}

function MacroTile({
  grams,
  label,
  pct,
}: {
  grams: number;
  label: string;
  pct: number;
}): React.JSX.Element {
  return (
    <View className="flex-1 items-center rounded-2xl border border-line bg-surface-subtle px-2 py-3">
      <Text className="text-lg font-extrabold text-ink">{grams} g</Text>
      <Text className="mt-0.5 text-xs text-ink-muted">{label}</Text>
      <Text className="text-xs text-ink-faint">{pct}%</Text>
    </View>
  );
}

/** Vista de solo lectura de un plan de alimentación (objetivo + macros + notas). */
export function NutritionPlanDetail({
  plan,
}: NutritionPlanDetailProps): React.JSX.Element {
  const { kcalPerDay, macros } = plan;

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
        <View>
          <Text className="text-2xl font-extrabold text-primary-dark">
            {kcalPerDay.toLocaleString('es-ES')} kcal
          </Text>
          <Text className="text-sm text-ink-muted">objetivo diario</Text>
        </View>
      </View>

      <View className="gap-2.5">
        <Text className="text-sm font-bold text-ink">Reparto de macros</Text>
        <View className="flex-row gap-2.5">
          <MacroTile
            grams={macroGrams(kcalPerDay, macros.proteinPct, 4)}
            label="Proteína"
            pct={macros.proteinPct}
          />
          <MacroTile
            grams={macroGrams(kcalPerDay, macros.carbsPct, 4)}
            label="Carbos"
            pct={macros.carbsPct}
          />
          <MacroTile
            grams={macroGrams(kcalPerDay, macros.fatPct, 9)}
            label="Grasas"
            pct={macros.fatPct}
          />
        </View>
        <MacroBar macros={macros} />
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
