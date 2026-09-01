import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { formatMacros, MacroBar } from '@/components/MacroBar';
import type { NutritionPlan } from '@/types/nutrition';
import { NUTRITION_CATEGORY_LABEL, NUTRITION_CATEGORY_TONE } from '../labels';

interface NutritionPlanCardProps {
  plan: NutritionPlan;
  onPress?: () => void;
}

/** Tarjeta del catálogo de planes de alimentación. */
export function NutritionPlanCard({ plan, onPress }: NutritionPlanCardProps): React.JSX.Element {
  const content = (
    <View className="overflow-hidden rounded-2xl border border-line bg-surface">
      <View>
        <Image
          source={{ uri: plan.imageUrl }}
          className="h-32 w-full bg-surface-field"
          resizeMode="cover"
        />
        <Badge
          label={NUTRITION_CATEGORY_LABEL[plan.category]}
          tone={NUTRITION_CATEGORY_TONE[plan.category]}
          className="absolute left-3 top-3"
        />
      </View>

      <View className="gap-2 p-4">
        <Text className="text-base font-bold text-ink">{plan.name}</Text>
        <Text className="text-sm font-semibold text-primary">
          {plan.kcalPerDay} kcal/día
        </Text>

        <View className="mt-1 gap-1.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-ink-muted">Macros (P / C / G)</Text>
            <Text className="text-xs font-semibold text-ink-muted">
              {formatMacros(plan.macros)}
            </Text>
          </View>
          <MacroBar macros={plan.macros} />
        </View>

        <View className="mt-1 flex-row items-center gap-1.5">
          <Ionicons name="people-outline" size={15} color="#94A3B8" />
          <Text className="text-xs text-ink-faint">
            Asignado a {plan.assignedCount} usuarios
          </Text>
        </View>
      </View>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  );
}
