import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';

import { COLORS } from '@/lib/colors';
import type { Food } from '@/types/food';
import { MEAL_NAME_SUGGESTIONS, type MealDraft } from '../mealDraft';
import { MealItemRow } from './MealItemRow';

interface MealEditorCardProps {
  meal: MealDraft;
  foodsById: Map<string, Food>;
  mealKcal: number;
  onChangeName: (name: string) => void;
  onAddFood: () => void;
  onChangeItemQuantity: (itemId: string, value: number | null) => void;
  onRemoveItem: (itemId: string) => void;
  onRemoveMeal: () => void;
}

/** Tarjeta de una comida en el editor: nombre + alimentos + total. */
export function MealEditorCard({
  meal,
  foodsById,
  mealKcal,
  onChangeName,
  onAddFood,
  onChangeItemQuantity,
  onRemoveItem,
  onRemoveMeal,
}: MealEditorCardProps): React.JSX.Element {
  return (
    <View className="gap-3 rounded-2xl border border-line bg-surface p-4">
      <View className="flex-row items-center gap-2">
        <TextInput
          className="h-10 flex-1 rounded-xl border border-line bg-surface-field px-3 text-base font-semibold text-ink"
          value={meal.name}
          onChangeText={onChangeName}
          placeholder="Nombre de la comida"
          placeholderTextColor="#94A3B8"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quitar comida"
          hitSlop={8}
          onPress={onRemoveMeal}
          className="h-9 w-9 items-center justify-center rounded-lg active:bg-rose-50"
        >
          <Ionicons name="trash-outline" size={18} color="#E11D48" />
        </Pressable>
      </View>

      {meal.name === '' ? (
        <View className="flex-row flex-wrap gap-2">
          {MEAL_NAME_SUGGESTIONS.map((s) => (
            <Pressable
              key={s}
              accessibilityRole="button"
              onPress={() => onChangeName(s)}
              className="rounded-full border border-line px-3 py-1 active:bg-surface-subtle"
            >
              <Text className="text-xs font-semibold text-ink-muted">{s}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {meal.items.length === 0 ? (
        <Text className="text-sm text-ink-faint">Sin alimentos todavía.</Text>
      ) : (
        <View className="gap-2">
          {meal.items.map((item) => (
            <MealItemRow
              key={item.id}
              item={item}
              food={foodsById.get(item.foodId)}
              onChangeQuantity={(v) => onChangeItemQuantity(item.id, v)}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))}
        </View>
      )}

      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          onPress={onAddFood}
          className="flex-row items-center gap-1.5 rounded-full bg-primary-light px-3 py-1.5"
        >
          <Ionicons name="add" size={16} color={COLORS.primary} />
          <Text className="text-sm font-semibold text-primary">Añadir alimento</Text>
        </Pressable>
        <Text className="text-sm font-bold text-ink">{mealKcal} kcal</Text>
      </View>
    </View>
  );
}
