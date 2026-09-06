import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { COLORS } from '@/lib/colors';
import type { Food } from '@/types/food';
import { refQuantityLabel } from '../labels';

interface FoodListItemProps {
  food: Food;
  onPress?: () => void;
}

/** Fila de un alimento del catálogo: nombre + kcal/macros por porción de referencia. */
export function FoodListItem({ food, onPress }: FoodListItemProps): React.JSX.Element {
  const content = (
    <View className="flex-row items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
        <Ionicons name="nutrition-outline" size={18} color={COLORS.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-ink">{food.name}</Text>
        <Text className="text-xs text-ink-faint">
          {food.kcal} kcal · P {food.proteinG} / C {food.carbsG} / G {food.fatG} g ·{' '}
          {refQuantityLabel(food.unit, food.refQuantity)}
        </Text>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color="#94A3B8" /> : null}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  );
}
