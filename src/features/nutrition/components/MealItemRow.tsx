import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { NumberField } from '@/components/NumberField';
import { FOOD_UNIT_SUFFIX } from '@/features/foods';
import type { Food } from '@/types/food';
import { itemTotals } from '../nutritionMath';
import type { MealItemDraft } from '../mealDraft';

interface MealItemRowProps {
  item: MealItemDraft;
  food: Food | undefined;
  onChangeQuantity: (value: number | null) => void;
  onRemove: () => void;
}

/** Fila de un alimento dentro de una comida: nombre + cantidad + kcal + quitar. */
export function MealItemRow({
  item,
  food,
  onChangeQuantity,
  onRemove,
}: MealItemRowProps): React.JSX.Element {
  const kcal =
    food && item.quantity !== null ? itemTotals(item.quantity, food).kcal : 0;

  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-line bg-surface p-3">
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
          {food?.name ?? 'Alimento no encontrado'}
        </Text>
        <Text className="text-xs text-ink-faint">{kcal} kcal</Text>
      </View>

      <View className="w-28">
        <NumberField
          decimal
          suffix={food ? FOOD_UNIT_SUFFIX[food.unit] : ''}
          value={item.quantity}
          onChange={onChangeQuantity}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Quitar alimento"
        hitSlop={8}
        onPress={onRemove}
        className="h-8 w-8 items-center justify-center rounded-lg active:bg-rose-50"
      >
        <Ionicons name="close" size={18} color="#94A3B8" />
      </Pressable>
    </View>
  );
}
